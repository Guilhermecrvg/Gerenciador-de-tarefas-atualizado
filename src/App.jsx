import { useState, useEffect, useMemo } from "react";
import "./App.css";

export default function App() {
  // --- TEMA ---
  const [tema, setTema] = useState(() => {
    return localStorage.getItem("tema_app") || "escuro";
  });

  // --- AUTENTICAÇÃO ---
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario_ativo");
    return salvo ? JSON.parse(salvo) : null;
  });
  const [isRegistro, setIsRegistro] = useState(false);
  const [authNome, setAuthNome] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authSenha, setAuthSenha] = useState("");
  const [authErro, setAuthErro] = useState("");

  // --- TAREFAS ---
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState("");
  const [tempoTarefa, setTempoTarefa] = useState(""); // Novo estado para tempo em minutos
  const [categoria, setCategoria] = useState("Pessoal");
  const [prioridade, setPrioridade] = useState("Média");
  const [filtro, setFiltro] = useState("todas");
  const [pesquisa, setPesquisa] = useState("");

  // Salva preferência de tema
  useEffect(() => {
    localStorage.setItem("tema_app", tema);
  }, [tema]);

  // Carrega as tarefas exclusivas do usuário logado ao entrar ou trocar de conta
  useEffect(() => {
    if (usuario) {
      const salvas = localStorage.getItem(`gerenciador_tarefas_${usuario.email}`);
      setTarefas(salvas ? JSON.parse(salvas) : []);
    } else {
      setTarefas([]);
    }
  }, [usuario]);

  // Salva as tarefas do usuário logado sempre que forem alteradas
  useEffect(() => {
    if (usuario) {
      localStorage.setItem(`gerenciador_tarefas_${usuario.email}`, JSON.stringify(tarefas));
    }
  }, [tarefas, usuario]);

  function alternarTema() {
    setTema((prev) => (prev === "escuro" ? "claro" : "escuro"));
  }

  // --- LÓGICA DE LOGIN E CADASTRO ---
  function handleAuth(e) {
    e.preventDefault();
    setAuthErro("");

    const usuariosCadastrados = JSON.parse(localStorage.getItem("usuarios_app") || "[]");

    if (isRegistro) {
      if (!authNome.trim() || !authEmail.trim() || !authSenha.trim()) {
        setAuthErro("Preencha todos os campos.");
        return;
      }
      const existe = usuariosCadastrados.some((u) => u.email === authEmail);
      if (existe) {
        setAuthErro("Este e-mail já está cadastrado.");
        return;
      }

      const novoUsuario = { nome: authNome.trim(), email: authEmail.trim(), senha: authSenha };
      usuariosCadastrados.push(novoUsuario);
      localStorage.setItem("usuarios_app", JSON.stringify(usuariosCadastrados));

      const dadosSessao = { nome: novoUsuario.nome, email: novoUsuario.email };
      setUsuario(dadosSessao);
      localStorage.setItem("usuario_ativo", JSON.stringify(dadosSessao));
    } else {
      const usuarioEncontrado = usuariosCadastrados.find(
        (u) => u.email === authEmail && u.senha === authSenha
      );

      if (!usuarioEncontrado) {
        setAuthErro("E-mail ou senha incorretos.");
        return;
      }

      const dadosSessao = { nome: usuarioEncontrado.nome, email: usuarioEncontrado.email };
      setUsuario(dadosSessao);
      localStorage.setItem("usuario_ativo", JSON.stringify(dadosSessao));
    }

    setAuthNome("");
    setAuthEmail("");
    setAuthSenha("");
  }

  function handleLogout() {
    setUsuario(null);
    localStorage.removeItem("usuario_ativo");
  }

  // --- LÓGICA DAS TAREFAS ---
  function adicionarTarefa() {
    if (novaTarefa.trim() === "") return;

    const tarefa = {
      id: Date.now(),
      titulo: novaTarefa.trim(),
      categoria: categoria || "Pessoal",
      prioridade: prioridade || "Média",
      tempo: tempoTarefa ? `${tempoTarefa} min` : "Sem tempo", // Tempo da tarefa
      concluida: false,
      data: new Date().toLocaleDateString("pt-BR"),
    };

    setTarefas((prev) => [...prev, tarefa]);
    setNovaTarefa("");
    setTempoTarefa("");
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
        {/* BOTÃO FLUTUANTE/TOPO DE TEMA */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
          <button className="btn-tema" onClick={alternarTema}>
            {tema === "escuro" ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
          </button>
        </div>

        {/* --- TELA DE LOGIN / CADASTRO --- */}
        {!usuario ? (
          <div className="autenticacao">
            <h2>{isRegistro ? "Criar Conta" : "Entrar no Gerenciador"}</h2>
            {authErro && <p className="erro-auth">{authErro}</p>}

            <form onSubmit={handleAuth} className="form-auth">
              {isRegistro && (
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={authNome}
                  onChange={(e) => setAuthNome(e.target.value)}
                />
              )}
              <input
                type="email"
                placeholder="E-mail"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                value={authSenha}
                onChange={(e) => setAuthSenha(e.target.value)}
              />
              <button type="submit" className="btn-adicionar">
                {isRegistro ? "Cadastrar" : "Entrar"}
              </button>
            </form>

            <button
              className="btn-alternar-auth"
              onClick={() => {
                setIsRegistro(!isRegistro);
                setAuthErro("");
              }}
              style={{ marginTop: "15px", background: "none", border: "none", cursor: "pointer", color: "inherit", textDecoration: "underline" }}
            >
              {isRegistro
                ? "Já tem uma conta? Faça login"
                : "Não tem uma conta? Cadastre-se"}
            </button>
          </div>
        ) : (
          /* --- TELA PRINCIPAL DO GERENCIADOR --- */
          <>
            <div className="cabecalho">
              <div>
                <h1>Gerenciador de Tarefas</h1>
                <p>Bem-vindo(a), <strong>{usuario.nome}</strong>!</p>
              </div>
              <button className="excluir" onClick={handleLogout}>
                Sair
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

              <input
                type="number"
                placeholder="Tempo (min)"
                value={tempoTarefa}
                onChange={(e) => setTempoTarefa(e.target.value)}
                min="1"
                style={{ width: "110px" }}
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
                        <span>⏱ {tarefa.tempo}</span>
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
          </>
        )}
      </div>
    </div>
  );
}