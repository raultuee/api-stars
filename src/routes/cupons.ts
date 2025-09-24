import { Router } from "express";
import Cupons from "../models/Cupom";

const router = Router();

// Criar
router.post("/", async (req, res) => {
  try {
    const cupons = new Cupons(req.body);
    await cupons.save();
    res.json(cupons);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// Listar todas
router.get("/", async (_req, res) => {
  const cupons = await Cupons.find();
  res.json(cupons);
});

// Buscar por ID
router.get("/:id", async (req, res) => {
  const cupons = await Cupons.findById(req.params.id);
  if (!cupons) return res.status(404).json({ error: "Não encontrada" });
  res.json(cupons);
});

// Atualizar
router.put("/:id", async (req, res) => {
  const cupons = await Cupons.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(cupons);
});

// Deletar
router.delete("/:id", async (req, res) => {
  await Cupons.findByIdAndDelete(req.params.id);
  res.json({ message: "Cupons removida" });
});

export default router;
