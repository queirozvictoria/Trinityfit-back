import express from "express";
import cors from "cors";

import alunoRoutes from "./src/routes/alunoRoutes.js";
import personalRoutes from "./src/routes/personalRoutes.js";
import planoTreinoRoutes from "./src/routes/planoTreinoRoutes.js";
import agendamentoRoutes from "./src/routes/agendamentoRoutes.js";
import disponibilidadeRoutes from "./src/routes/disponibilidadeRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/alunos", alunoRoutes);
app.use("/personal", personalRoutes);
app.use("/plano-treino", planoTreinoRoutes);
app.use("/agendamento", agendamentoRoutes);
app.use("/disponibilidade", disponibilidadeRoutes);

export default app;
