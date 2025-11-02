import {Sandbox} from "@e2b/code-interpreter";

export async function getSandBox(sandBoxId:string){
    const sandbox = await Sandbox.connect(sandBoxId);
    return sandbox;
}