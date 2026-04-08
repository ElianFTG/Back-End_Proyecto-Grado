import { MysqlColorRepository } from "../../../infrastructure/repositories/MysqlColorRepository";
import { CreateColor } from "../../../application/color/CreateColor";
import { GetAllColors } from "../../../application/color/GetAllColors";
import { FindByIdColor } from "../../../application/color/FindByIdColor";
import { UpdateColor } from "../../../application/color/UpdateColor";
import { UpdateStateColor } from "../../../application/color/UpdateStateColor";

const colorRepository = new MysqlColorRepository();

export const ColorServiceContainer = {
    color: {
        getAll: new GetAllColors(colorRepository),
        create: new CreateColor(colorRepository),
        findById: new FindByIdColor(colorRepository),
        update: new UpdateColor(colorRepository),
        updateState: new UpdateStateColor(colorRepository),
    }
}
