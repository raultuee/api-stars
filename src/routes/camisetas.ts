import { Router } from "express";
import Camiseta from "../models/Camiseta";

const router = Router();

// Criar
router.post("/", async (req, res) => {
  try {
    const camiseta = new Camiseta(req.body);
    await camiseta.save();
    res.json(camiseta);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Listar todas
router.get("/", async (_req, res) => {
  const camisetas = await Camiseta.find();
  res.json(camisetas);
});

// Buscar por ID
router.get("/:id", async (req, res) => {
  const camiseta = await Camiseta.findById(req.params.id);
  if (!camiseta) return res.status(404).json({ error: "Não encontrada" });
  res.json(camiseta);
});

// Atualizar
router.put("/:id", async (req, res) => {
  const camiseta = await Camiseta.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(camiseta);
});

// Deletar
router.delete("/:id", async (req, res) => {
  await Camiseta.findByIdAndDelete(req.params.id);
  res.json({ message: "Camiseta removida" });
});

export default router;
