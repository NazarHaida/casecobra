"use server"

import {$Enums, CaseColor, CaseFinish, CaseMaterial} from "@prisma/client";
import PhoneModel = $Enums.PhoneModel;
import {db} from "@/db";

export type saveConfigProps = {
    color: CaseColor,
    finish: CaseFinish,
    material: CaseMaterial,
    model: PhoneModel,
    configId: string
}

export async function saveConfig({color, finish, material, model, configId}: saveConfigProps){
    await db.configuration.update({where: {id: configId}, data: {color, finish, material, model}})
}