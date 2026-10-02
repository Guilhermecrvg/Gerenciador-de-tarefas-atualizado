import { useState, useEffect, useMemo } from "react";
import "./App.css";

export default function App() {
  const [tema, setTema] = useState(() => {
    return localStorage.getItem("tema_app") || "escuro";
  });

  const [tarefas, setTarefas] = useState(() => {
    const salvas = localStorage.getItem("gerenciador_tarefas");
    return salvas ? JSON.parse(salvas) : [];
  });

  const [novaTarefa, setNovaTarefa] = useState("");
  const [categoria, setCategoria] = useState("Pessoal");
  const [prioridade, setPrioridade] = useState("Média");
  const [filtro, setFiltro] = useState("todas");
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    localStorage.setItem("tema_app", tema);
  }, [tema]);

  useEffect(() => {
    localStorage.setItem("gerenciador_tarefas", JSON.stringify(tarefas));
  }, [tarefas]);

  function alternarTema() {
    setTema((prev) => (prev === "escuro" ? "claro" : "escuro"));
  }

  function adicionarTarefa() {
    if (novaTarefa.trim() === "") return;

    const tarefa = {
      id: Date.now(),
      titulo: novaTarefa.trim(),
      categoria: categoria || "Pessoal",
      prioridade: prioridade || "Média",
      concluida: false,
      data: new Date().toLocaleDateString("pt-BR"),
    };

    setTarefas((prev) => [...prev, tarefa]);
    setNovaTarefa("");
  }

  function alternarTarefa(id) {
    setTarefas((prev) =>
      prev.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
      )
    );
  }

  function excluirTarefa(id) {
    setTarefas((prev) => prev.filter((tarefa) => tarefa.id !== id));
  }

  const { concluidas, pendentes, progresso } = useMemo(() => {
    const total = tarefas.length;
    const concluidasCount = tarefas.filter((t) => t.concluida).length;
    const pendentesCount = total - concluidasCount;
    const progressoPercent =
      total > 0 ? Math.round((concluidasCount / total) * 100) : 0;

    return {
      concluidas: concluidasCount,
      pendentes: pendentesCount,
      progresso: progressoPercent,
    };
  }, [tarefas]);

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((tarefa) => {
      const pesquisaOk = tarefa.titulo
        .toLowerCase()
        .includes(pesquisa.toLowerCase());

      const filtroOk =
        !filtro ||
        filtro === "todas" ||
        (filtro === "pendentes" && !tarefa.concluida) ||
        (filtro === "concluidas" && tarefa.concluida);

      return pesquisaOk && filtroOk;
    });
  }, [tarefas, pesquisa, filtro]);

  return (
    <div className={`app-wrapper tema-${tema}`}>
      <div className="app">
        <div className="cabecalho">
          <h1>Gerenciador de Tarefas</h1>
          <button className="btn-tema" onClick={alternarTema}>
            {tema === "escuro" ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
          </button>
        </div>

        <div className="resumo">
          <div>
            <span>Total de Tarefas</span>
            <strong>{tarefas.length}</strong>
          </div>
          <div>
            <span>Pendentes</span>
            <strong>{pendentes}</strong>
          </div>
          <div>
            <span>Concluídas</span>
            <strong>{concluidas}</strong>
          </div>
        </div>

        <div className="progresso">
          <div>
            <span>Progresso Geral</span>
            <strong>{progresso}%</strong>
          </div>
          <div className="barra">
            <div style={{ width: `${progresso}%` }}></div>
          </div>
        </div>

        <div className="formulario">
          <input
            type="text"
            placeholder="O que você precisa fazer?"
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
          />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="Pessoal">Pessoal</option>
            <option value="Trabalho">Trabalho</option>
            <option value="Estudo">Estudo</option>
            <option value="Projetos">Projetos</option>
            <option value="Outros">Outros</option>
          </select>

          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value)}
          >
            <option value="Baixa">Prioridade Baixa</option>
            <option value="Média">Prioridade Média</option>
            <option value="Alta">Prioridade Alta</option>
          </select>

          <button className="btn-adicionar" onClick={adicionarTarefa}>
            Adicionar
          </button>
        </div>

        <input
          className="pesquisa"
          type="text"
          placeholder="Buscar tarefa por nome..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />

        <div className="filtros">
          <button
            className={filtro === "todas" ? "ativo" : ""}
            onClick={() => setFiltro("todas")}
          >
            Todas ({tarefas.length})
          </button>
          <button
            className={filtro === "pendentes" ? "ativo" : ""}
            onClick={() => setFiltro("pendentes")}
          >
            Pendentes ({pendentes})
          </button>
          <button
            className={filtro === "concluidas" ? "ativo" : ""}
            onClick={() => setFiltro("concluidas")}
          >
            Concluídas ({concluidas})
          </button>
        </div>

        <div className="lista">
          {tarefasFiltradas.length === 0 ? (
            <div className="vazio">Nenhuma tarefa encontrada.</div>
          ) : (
            tarefasFiltradas.map((tarefa) => (
              <div
                key={tarefa.id}
                className={`tarefa ${tarefa.concluida ? "concluida" : ""}`}
              >
                <div className="informacoes">
                  <h3>{tarefa.titulo}</h3>
                  <div className="detalhes">
                    <span className="badge-categoria">{tarefa.categoria}</span>
                    <span
                      className={`prioridade ${tarefa.prioridade
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")}`}
                    >
                      ● {tarefa.prioridade}
                    </span>
                    <span>Criado em: {tarefa.data}</span>
                  </div>
                </div>

                <div className="acoes">
                  <button
                    className="concluir"
                    onClick={() => alternarTarefa(tarefa.id)}
                  >
                    {tarefa.concluida ? "Desfazer" : "Concluir"}
                  </button>
                  <button
                    className="excluir"
                    onClick={() => excluirTarefa(tarefa.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}