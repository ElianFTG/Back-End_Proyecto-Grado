import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";

import { Business } from "../../../domain/business/Business";
import { Position } from "../../../domain/customs/Position";
import { BusinessServiceContainer } from "../../../shared/service_containers/business/BusinessServiceContainer";


const BUSINESS_IMAGE_DIR_ABS = path.resolve(process.cwd(), "private/images/business");
const BUSINESS_PUBLIC_BASE = "/images/business";

function toResponse(b: Business) {
  return {
    id: b.id,
    name: b.name,
    nit: b.nit,
    position: b.position,
    pathImage: b.pathImage,
    address: b.address,
    businessTypeId: b.businessTypeId,
    clientId: b.clientId,
    areaId: b.areaId,
    isActive: b.isActive,
  };
}

function parseOptionalNumber(raw: any): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function normalizePosition(raw: any): Position | null {
  if (raw === undefined || raw === null || raw === "") return null;

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

async function ensureDir() {
  await fs.mkdir(BUSINESS_IMAGE_DIR_ABS, { recursive: true });
}

function extFromFile(file: Express.Multer.File): string {
  const mime = (file.mimetype || "").toLowerCase();
  const name = (file.originalname || "").toLowerCase();
  if (mime.includes("jpeg") || name.endsWith(".jpeg") || name.endsWith(".jpg")) return "jpg";
  if (mime.includes("png") || name.endsWith(".png")) return "png";
  if (mime.includes("webp") || name.endsWith(".webp")) return "webp";
  return "jpg";
}

async function deleteExistingById(id: number) {
  await ensureDir();
  const files = await fs.readdir(BUSINESS_IMAGE_DIR_ABS);
  const pref = `${id}.`;
  await Promise.all(
    files
      .filter((f) => f.startsWith(pref))
      .map((f) =>
        fs.unlink(path.join(BUSINESS_IMAGE_DIR_ABS, f)).catch(() => undefined)
      )
  );
}

async function saveImage(id: number, file: Express.Multer.File): Promise<string> {
  await deleteExistingById(id);
  const ext = extFromFile(file);
  const filename = `${id}.${ext}`;
  await fs.writeFile(path.join(BUSINESS_IMAGE_DIR_ABS, filename), file.buffer);
  return `${BUSINESS_PUBLIC_BASE}/${filename}`;
}

export class BusinessController {
  async create(req: Request, res: Response) {
    const userId = req.auth?.userId ?? null;
    const body: any = req.body;

    if (!body.name) return res.status(400).json({ message: "name requerido" });

    const businessTypeId = Number(body.business_type_id);
    const clientId = Number(body.client_id);

    if (Number.isNaN(businessTypeId)) return res.status(400).json({ message: "businessTypeId inválido" });
    if (Number.isNaN(clientId)) return res.status(400).json({ message: "clientId inválido" });


    const areaId = parseOptionalNumber(body.areaId);
    if (body.areaId !== undefined && body.areaId !== null && body.areaId !== "" && areaId === null) {
      return res.status(400).json({ message: "areaId inválido" });
    }

    const position = normalizePosition(body.position);
    if (body.position !== undefined && body.position !== null && body.position !== "" && position === null) {
      return res.status(400).json({ message: "position inválido (usa {lat,lng})" });
    }

    const isActive = body.is_active === undefined ? true : String(body.is_active) === "true" || body.is_active === true;

    const business = new Business(
      body.name,
      businessTypeId,
      clientId,
      areaId,
      body.nit ?? null,
      position,
      null,
      body.address ?? null,
      isActive
    );

    const created = await BusinessServiceContainer.business.createBusiness.run(business, userId);
    if (!created?.id) return res.status(400).json({ message: "No se pudo crear el negocio" });

    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      const publicPath = await saveImage(created.id, file);
      const updated = await BusinessServiceContainer.business.updateBusiness.run(
        created.id,
        { pathImage: publicPath },
        userId
      );
      return res.status(201).json(toResponse(updated ?? created));
    }

    return res.status(201).json(toResponse(created));
  }

  async getAll(req: Request, res: Response) {
    const list = await BusinessServiceContainer.business.getBusinesses.run();
    return res.status(200).json(list.map(toResponse));
  }

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const b = await BusinessServiceContainer.business.findByIdBusiness.run(id);
    if (!b) return res.status(404).json({ message: "Negocio no encontrado" });

    return res.status(200).json(toResponse(b));
  }

  async update(req: Request, res: Response) {
    const userId = req.auth?.userId ?? null;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const body: any = req.body;
    const patch: any = {};

    if (body.name !== undefined) patch.name = body.name;
    if (body.nit !== undefined) patch.nit = body.nit;
    if (body.address !== undefined) patch.address = body.address;

    if (body.is_active !== undefined) {
      patch.is_active = String(body.is_active) === "true" || body.is_active === true;
    }

    if (body.business_type_id !== undefined) {
      const v = Number(body.business_type_id);
      if (Number.isNaN(v)) return res.status(400).json({ message: "businessTypeId inválido" });
      patch.businessTypeId = v;
    }

    if (body.client_id !== undefined) {
      const v = Number(body.client_id);
      if (Number.isNaN(v)) return res.status(400).json({ message: "clientId inválido" });
      patch.clientId = v;
    }

    if (body.area_id !== undefined) {
      if (body.area_id === null || body.area_id === "") {
        patch.area_id = null;
      } else {
        const v = Number(body.area_id);
        if (Number.isNaN(v)) return res.status(400).json({ message: "areaId inválido" });
        patch.areaId = v;
      }
    }

    if (body.position !== undefined) {
      const pos = normalizePosition(body.position);
      if (body.position !== null && body.position !== "" && pos === null) {
        return res.status(400).json({ message: "position inválido (usa {lat,lng})" });
      }
      patch.position = pos; 
    }

    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      const publicPath = await saveImage(id, file);
      patch.pathImage = publicPath;
    }

    const updated = await BusinessServiceContainer.business.updateBusiness.run(id, patch, userId);
    if (!updated) return res.status(404).json({ message: "Negocio no encontrado" });

    return res.status(200).json(toResponse(updated));
  }

  async softDelete(req: Request, res: Response) {
    const userId = req.auth?.userId ?? null;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const ok = await BusinessServiceContainer.business.softDeleteBusiness.run(id, userId);
    if (!ok) return res.status(404).json({ message: "Negocio no encontrado" });

    return res.status(200).json({ message: "Eliminado" });
  }
}
