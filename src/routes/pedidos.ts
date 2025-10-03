import { Router, Request, Response } from "express";
// Importa o modelo padrão e a interface IPedido do arquivo de modelo
import Pedido, { IPedido } from "../models/Pedido";

const router = Router();

// Listar todos os pedidos
router.get("/", async (req: Request, res: Response) => {
  try {
    const pedidos = await Pedido.find();
    res.json(pedidos);
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    res.status(500).json({ error: "Erro ao listar pedidos" });
  }
});

// Rota leve apenas para keep-alive
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Buscar pedido por ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    // Busca pelo ID numérico sequencial, e não pelo _id do MongoDB
    const pedido = await Pedido.findOne({ id: req.params.id });
    if (!pedido) return res.status(404).json({ msg: "Pedido não encontrado" });
    res.json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});

// Criar pedido
router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("📦 Recebendo pedido:", JSON.stringify(req.body, null, 2));

    // A validação dos campos obrigatórios será feita automaticamente pelo Mongoose
    // com base no seu Schema. Isso torna as validações manuais aqui desnecessárias.

    const pedido: IPedido = new Pedido(req.body);
    await pedido.save(); // Se algum campo obrigatório faltar, o .save() vai gerar um erro
    
    console.log("✅ Pedido criado com sucesso:", pedido._id);
    res.status(201).json(pedido);
  } catch (error: any) {
    console.error("❌ Erro ao criar pedido:", error);
    
    // Se for erro de validação do Mongoose, retorna os detalhes
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        error: "Erro de validação", 
        details: messages 
      });
    }
    
    res.status(500).json({ 
      error: "Erro ao criar pedido",
      message: error.message 
    });
  }
});

// Atualizar status do pedido (O código anterior já estava bom, mantido como está)
router.put("/:id/status", async (req: Request, res: Response) => {
  try {
    const { statusEntrega, statusPedido } = req.body;

    if (!statusEntrega && !statusPedido) {
      return res.status(400).json({ 
        msg: "É necessário fornecer 'statusEntrega' ou 'statusPedido' para atualização." 
      });
    }

    const camposParaAtualizar: { [key: string]: any } = {};
    if (statusEntrega) {
      camposParaAtualizar.statusEntrega = statusEntrega;
    }
    if (statusPedido) {
      camposParaAtualizar.statusPedido = statusPedido;
    }

    const pedidoAtualizado = await Pedido.findOneAndUpdate(
      { id: req.params.id }, // Busca pelo ID numérico
      { $set: camposParaAtualizar },
      { new: true, runValidators: true }
    );

    if (!pedidoAtualizado) {
      return res.status(404).json({ msg: "Pedido não encontrado" });
    }

    res.json(pedidoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

// Deletar pedido
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const pedido = await Pedido.findOneAndDelete({ id: req.params.id }); // Busca pelo ID numérico
    if (!pedido) {
      return res.status(404).json({ msg: "Pedido não encontrado" });
    }
    res.json({ msg: "Pedido deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    res.status(500).json({ error: "Erro ao deletar pedido" });
  }
});

export default router;