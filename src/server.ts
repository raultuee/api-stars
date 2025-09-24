import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import camisetasRoutes from "./routes/camisetas";
import cuponsRoutes from "./routes/cupons";
import pedidosRoutes from "./routes/pedidos";



dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

app.use(cors({
  origin: [
    "http://localhost:5173", // front local
    "https://t-shirts-omega.vercel.app" // front no Vercel
  ]
}));

// Conexão Atlas
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Conectado ao MongoDB Atlas"))
  .catch(err => console.error("❌ Erro MongoDB:", err));

// Rotas
app.use("/camisetas", camisetasRoutes);
app.use("/cupons", cuponsRoutes);
app.use("/pedidos", pedidosRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 API rodando na porta ${port}`));