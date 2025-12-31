import { Request, Response } from "express";
import { Area } from "../../../domain/area/Area";
import { AreaServiceContainer } from "../../../shared/service_containers/area/AreaServiceContainer";

function normalizeArea(raw: any): { lat: number; lng: number }[] | null {
    if (!raw) return null;
 
    if (Array.isArray(raw)) {
        return raw.map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }));
    }

    return null;
}

export class AreaController {
    async create(req: Request, res: Response) {
        const userId = req.auth?.userId ?? null;
        const body: any = req.body;

        const areaPoints = normalizeArea(body.area);
        if (!areaPoints || areaPoints.length < 3) {
            return res.status(400).json({ message: "area inválida (mínimo 3 puntos)" });
        }

        const area = new Area(body.name, areaPoints);

        const created = await AreaServiceContainer.area.createArea.run(area, userId);
        if (!created?.id) return res.status(400).json({ message: "No se pudo crear el área" });

        return res.status(201).json(created);
    }

    async getAll(req: Request, res: Response) {
        const areas = await AreaServiceContainer.area.getAreas.run();
        return res.status(200).json(areas);
    }

    async findById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

        const area = await AreaServiceContainer.area.findByIdArea.run(id);
        if (!area) return res.status(404).json({ message: "Área no encontrada" });

        return res.status(200).json(area);
    }

    async update(req: Request, res: Response) {
        const userId = req.auth?.userId ?? null;
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

        const body: any = req.body;
        const patch: any = {};

        if (body.name !== undefined) patch.name = body.name;

        if (body.area !== undefined) {
            const areaPoints = normalizeArea(body.area);
            if (!areaPoints || areaPoints.length < 3) {
                return res.status(400).json({ message: "area inválida (mínimo 3 puntos)" });
            }
            patch.area = areaPoints;
        }

        const updated = await AreaServiceContainer.area.updateArea.run(id, patch, userId);
        if (!updated) return res.status(404).json({ message: "Área no encontrada" });

        return res.status(200).json(updated);
    }

    async softDelete(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });

        const ok = await AreaServiceContainer.area.softDeleteArea.run(id);
        if (!ok) return res.status(404).json({ message: "Área no encontrada" });

        return res.status(200).json({ message: "Eliminado" });
    }
}
