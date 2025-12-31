import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";


import { Client } from "../../../domain/client/Client";
import { ClientServiceContainer } from "../../../shared/service_containers/client/ClientServiceContainer";
import { Position } from "../../../domain/customs/Position";


const CLIENT_IMAGE_DIR_REL = "private/images/clients";
const CLIENT_IMAGE_DIR_ABS = path.resolve(process.cwd(), CLIENT_IMAGE_DIR_REL);


const CLIENT_IMAGE_PUBLIC_BASE = "/images/clients";


function normalizePosition(raw: any): Position | null {
  if (!raw) return null;

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      const lat = typeof parsed?.lat === "string" ? Number(parsed.lat) : parsed?.lat;
      const lng = typeof parsed?.lng === "string" ? Number(parsed.lng) : parsed?.lng;

      if (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng)
      ) {
        return { lat, lng };
      }
      return null;
    } catch {
      return null;
    }
  }

  const lat = typeof raw?.lat === "string" ? Number(raw.lat) : raw?.lat;
  const lng = typeof raw?.lng === "string" ? Number(raw.lng) : raw?.lng;

  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
  ) {
    return { lat, lng };
  }

  return null;
}

async function ensureDirExists() {
  await fs.mkdir(CLIENT_IMAGE_DIR_ABS, { recursive: true });
}

function extFromMimetypeOrName(mimetype?: string, originalname?: string): string {
  const mime = (mimetype || "").toLowerCase();
  const name = (originalname || "").toLowerCase();

  if (mime.includes("jpeg") || name.endsWith(".jpeg") || name.endsWith(".jpg")) return "jpg";
  if (mime.includes("png") || name.endsWith(".png")) return "png";
  if (mime.includes("webp") || name.endsWith(".webp")) return "webp";

  return "jpg";
}

async function deleteExistingClientImages(clientId: number) {
  await ensureDirExists();
  const files = await fs.readdir(CLIENT_IMAGE_DIR_ABS);
  const prefix = `${clientId}.`;
  const toDelete = files.filter((f) => f.startsWith(prefix));
  await Promise.all(
    toDelete.map((f) => fs.unlink(path.join(CLIENT_IMAGE_DIR_ABS, f)).catch(() => undefined))
  );
}


async function saveClientImageAndGetPublicPath(clientId: number, file: Express.Multer.File): Promise<string> {
  await ensureDirExists();
  await deleteExistingClientImages(clientId);

  const ext = extFromMimetypeOrName(file.mimetype, file.originalname);
  const filename = `${clientId}.${ext}`;
  const destAbs = path.join(CLIENT_IMAGE_DIR_ABS, filename);

  await fs.writeFile(destAbs, file.buffer);

  return `${CLIENT_IMAGE_PUBLIC_BASE}/${filename}`;
}


export class ClientController {
  async create(req: Request, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    const body: any = req.body;

    const position = normalizePosition(body.position);
    if (!position) return res.status(400).json({ message: "position inválido (usa {lat,lng})" });

    const areaId = body.areaId === undefined || body.areaId === "" ? null : Number(body.areaId);

    const client = new Client(
      body.fullName,
      position,
      body.nitCi,
      body.businessName,
      body.phone,
      body.businessType,
      body.clientType,
      areaId,
      true,
      body.address ?? null,
      null 
    );

    const created = await ClientServiceContainer.client.createClient.run(client, userId);
    if (!created?.id) {
      return res.status(400).json({ message: "No se pudo crear (nitCi duplicado?)" });
    }

    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      try {
        const publicPath = await saveClientImageAndGetPublicPath(created.id, file);

        await ClientServiceContainer.client.updateClient.run(
          created.id,
          { pathImage: publicPath },
          userId
        );
      } catch (err) {
        return res.status(500).json({
          message: "Cliente creado, pero falló el guardado de la imagen",
          error: String(err),
        });
      }
    }

    const finalClient = await ClientServiceContainer.client.findByIdClient.run(created.id);
    return res.status(201).json(finalClient ?? created);
  }

  async getAll(req: Request, res: Response) {
    const clients = await ClientServiceContainer.client.getClients.run(true);
    return res.status(200).json(clients);
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const client = await ClientServiceContainer.client.findByIdClient.run(id);
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });

    return res.status(200).json(client);
  }

  async update(req: Request, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const body: any = req.body;
    const patch: any = { ...body };

    if (body.position !== undefined) {
      const position = normalizePosition(body.position);
      if (!position) return res.status(400).json({ message: "position inválido (usa {lat,lng})" });
      patch.position = position;
    }

    if (body.areaId !== undefined) {
      patch.areaId = body.areaId === "" ? null : Number(body.areaId);
    }

    if ("pathImage" in patch) delete patch.pathImage;
    if ("path_image" in patch) delete patch.path_image;

    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      try {
        const publicPath = await saveClientImageAndGetPublicPath(id, file);
        patch.pathImage = publicPath;
      } catch (err) {
        return res.status(500).json({ message: "Falló el guardado de la imagen", error: String(err) });
      }
    }

    const updated = await ClientServiceContainer.client.updateClient.run(id, patch, userId);
    if (!updated) return res.status(404).json({ message: "Cliente no encontrado" });

    return res.status(200).json(updated);
  }

  async softDelete(req: Request, res: Response) {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "No autenticado" });

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "Cliente no encontrado" });

    const ok = await ClientServiceContainer.client.softDeleteClient.run(id, userId);
    if (!ok) return res.status(404).json({ message: "Cliente no encontrado" });

    return res.status(200).json({ message: "Eliminado" });
  }
}
