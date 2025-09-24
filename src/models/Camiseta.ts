import { Schema, model } from "mongoose";

const CamisetaSchema = new Schema({
  nome: { type: String, required: true },
  tamanho: { type: String, required: true },
  tipo: { type: String, enum: ["Oversized", "Regular"], required: true },
  preco: { type: Number, required: true },
  imagem: { type: String } // opcional
}, { timestamps: true });

export default model("Camiseta", CamisetaSchema);
