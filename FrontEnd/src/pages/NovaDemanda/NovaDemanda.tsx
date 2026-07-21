import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiBox,
  FiChevronDown,
  FiCircle,
  FiSettings,
  FiTool,
  FiTruck,
} from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import { getUsuarioLogado } from "../../services/auth";
import { enviarAnexoApi } from "../../services/anexos";
import { criarDemandaApi } from "../../services/demandas";
import Header from "../../components/Header/Header";
import "./NovaDemanda.css";

type Prioridade = "Normal" | "Alta" | "Urgente";
type TipoServico =
  | "Manutenção / Oficina"
  | "Reparos / Serviços"
  | "Compra de Materiais"
  | "Outros / Solicitação";

function NovaDemanda() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();

  const [tituloDemanda, setTituloDemanda] = useState("");
  const [oficinaLaboratorio, setOficinaLaboratorio] = useState("");
  const [tipoServico, setTipoServico] = useState<TipoServico | "">("");
  const [dataSolicitada, setDataSolicitada] = useState("");
  const [prioridade, setPrioridade] = useState<Prioridade>("Normal");
  const [descricaoDemanda, setDescricaoDemanda] = useState("");
  const [anexos, setAnexos] = useState<File[]>([]);
  const [salvando, setSalvando] = useState(false);

  const numeroDemanda = "—";
  const prazoResposta =
    prioridade === "Urgente"
      ? "Até 2 horas"
      : prioridade === "Alta"
        ? "Até 8 horas"
        : "Até 24 horas";

  const dataFormatada = useMemo(() => {
    if (!dataSolicitada) return "—";
    return new Date(dataSolicitada).toLocaleString("pt-BR");
  }, [dataSolicitada]);

  async function salvarDemanda(evento: React.FormEvent) {
    evento.preventDefault();

    if (!usuario) {
      alert("Usuário não encontrado. Faça login novamente.");
      navigate("/login");
      return;
    }

    if (usuario.perfil === "Admin" || usuario.perfil === "Almoxarife") {
      alert("Seu perfil nao pode abrir novas demandas.");
      navigate("/dashboard");
      return;
    }

    if (!tipoServico) {
      alert("Selecione o tipo de serviço.");
      return;
    }

    setSalvando(true);

    try {
      const demandaCriada = await criarDemandaApi({
        titulo: tituloDemanda,
        descricao: `${descricaoDemanda}\n\nTipo de serviço: ${tipoServico}`,
        oficina: oficinaLaboratorio,
        prioridade,
        dataHoraNecessaria: new Date(dataSolicitada).toISOString(),
      });

      if (anexos.length > 0) {
        await Promise.all(
          anexos.map((anexo) => enviarAnexoApi(demandaCriada.id, anexo)),
        );
      }

      alert("Demanda salva com sucesso!");
      navigate("/demandas");
    } catch {
      alert("Não foi possível salvar a demanda. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  function adicionarAnexos(arquivos: FileList | null) {
    if (!arquivos) return;

    setAnexos((anexosAtuais) => [...anexosAtuais, ...Array.from(arquivos)]);
  }

  function removerAnexo(nome: string) {
    setAnexos((anexosAtuais) =>
      anexosAtuais.filter((anexo) => anexo.name !== nome),
    );
  }

  return (
    <div className="nova-demanda-layout">
      <Sidebar />

      <main className="nova-demanda-main">
        <Header titulo="Nova Demanda" />
        <section className="nova-demanda-conteudo">
        <header className="nova-demanda-topo">
          <div className="nova-demanda-breadcrumb">
            <button type="button" onClick={() => navigate("/demandas")}>
              Demandas
            </button>
            <span>›</span>
            <strong>Nova Demanda</strong>
          </div>
        </header>

        <form className="nova-demanda-formulario" onSubmit={salvarDemanda}>
          <section className="nova-demanda-card nova-demanda-card-principal">
            <h2>Informações da Demanda</h2>

            <div className="nova-demanda-grupo">
              <label>
                Título da Demanda <span>*</span>
              </label>
              <input
                type="text"
                placeholder="Ex.: Manutenção preventiva, revisão de veículo, compra de peças..."
                value={tituloDemanda}
                onChange={(evento) => setTituloDemanda(evento.target.value)}
                required
              />
            </div>

            <div className="nova-demanda-grupo">
              <label>
                Oficina / Laboratório <span>*</span>
              </label>
              <div className="nova-demanda-select">
                <select
                  value={oficinaLaboratorio}
                  onChange={(evento) =>
                    setOficinaLaboratorio(evento.target.value)
                  }
                  required
                >
                  <option value="">Selecione uma opção</option>
                  <option value="Chassi">Chassi</option>
                  <option value="Pneumática">Pneumática</option>
                  <option value="Motores Ciclo Otto">Motores Ciclo Otto</option>
                  <option value="Elétrica e Eletrônica">
                    Elétrica e Eletrônica
                  </option>
                </select>
                <FiChevronDown />
              </div>
            </div>

            <div className="nova-demanda-grupo">
              <label>
                Tipo de Serviço <span>*</span>
              </label>
              <div className="nova-demanda-servicos">
                <button
                  type="button"
                  className={
                    tipoServico === "Manutenção / Oficina" ? "ativo" : ""
                  }
                  onClick={() => setTipoServico("Manutenção / Oficina")}
                >
                  <FiSettings />
                  <span>Manutenção / Oficina</span>
                </button>
                <button
                  type="button"
                  className={
                    tipoServico === "Reparos / Serviços" ? "ativo" : ""
                  }
                  onClick={() => setTipoServico("Reparos / Serviços")}
                >
                  <FiTool />
                  <span>Reparos / Serviços</span>
                </button>
                <button
                  type="button"
                  className={
                    tipoServico === "Compra de Materiais" ? "ativo" : ""
                  }
                  onClick={() => setTipoServico("Compra de Materiais")}
                >
                  <FiBox />
                  <span>Compra de Materiais</span>
                </button>
                <button
                  type="button"
                  className={
                    tipoServico === "Outros / Solicitação" ? "ativo" : ""
                  }
                  onClick={() => setTipoServico("Outros / Solicitação")}
                >
                  <FiTruck />
                  <span>Outros / Solicitação</span>
                </button>
              </div>
            </div>

            <div className="nova-demanda-grupo">
              <label>
                Data Solicitada <span>*</span>
              </label>
              <div className="nova-demanda-data">
                <input
                  type="datetime-local"
                  value={dataSolicitada}
                  onChange={(evento) => setDataSolicitada(evento.target.value)}
                  required
                />
              </div>
            </div>

            <div className="nova-demanda-grupo">
              <label>
                Prioridade <span>*</span>
              </label>
              <div className="nova-demanda-prioridades">
                <button
                  type="button"
                  className={`normal ${prioridade === "Normal" ? "ativo" : ""}`}
                  onClick={() => setPrioridade("Normal")}
                >
                  <strong>
                    <FiCircle /> Normal
                  </strong>
                  <span>Baixa prioridade</span>
                </button>
                <button
                  type="button"
                  className={`alta ${prioridade === "Alta" ? "ativo" : ""}`}
                  onClick={() => setPrioridade("Alta")}
                >
                  <strong>
                    <FiAlertTriangle /> Alta
                  </strong>
                  <span>Atenção</span>
                </button>
                <button
                  type="button"
                  className={`urgente ${prioridade === "Urgente" ? "ativo" : ""}`}
                  onClick={() => setPrioridade("Urgente")}
                >
                  <strong>
                    <FiAlertTriangle /> Urgente
                  </strong>
                  <span>Alta prioridade</span>
                </button>
              </div>
            </div>

            <div className="nova-demanda-grupo">
              <label>
                Descrição da Demanda <span>*</span>
              </label>
              <textarea
                maxLength={500}
                placeholder="Descreva com detalhes o que precisa ser realizado..."
                value={descricaoDemanda}
                onChange={(evento) => setDescricaoDemanda(evento.target.value)}
                required
              />
              <p className="nova-demanda-contador">
                {descricaoDemanda.length} / 500
              </p>
            </div>
          </section>

          <aside className="nova-demanda-lateral">
            <section className="nova-demanda-card">
              <h2>Informações Adicionais</h2>
              <div className="nova-demanda-info">
                <strong>Número da Demanda</strong>
                <span>{numeroDemanda}</span>
              </div>
              <div className="nova-demanda-info">
                <strong>Tipo de Atendimento</strong>
                <span>{tipoServico || "—"}</span>
              </div>
              <div className="nova-demanda-info">
                <strong>Prazo de Resposta</strong>
                <span>{prazoResposta}</span>
              </div>
              <div className="nova-demanda-info">
                <strong>Data e Hora Limite</strong>
                <span>{dataFormatada}</span>
              </div>
              <div className="nova-demanda-info">
                <strong>Prioridade</strong>
                <span>{prioridade}</span>
              </div>
              <div className="nova-demanda-info">
                <strong>Solicitante</strong>
                <span>{usuario?.nome || "—"}</span>
              </div>
            </section>

            <section className="nova-demanda-card nova-demanda-anexos">
              <h2>Fotos / Anexos</h2>

              <label className="nova-demanda-botao-anexo">
                Selecionar anexos
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(evento) => adicionarAnexos(evento.target.files)}
                />
              </label>

              <div className="nova-demanda-lista-anexos">
                {anexos.length === 0 && <p>Nenhum anexo selecionado</p>}

                {anexos.map((anexo) => (
                  <div key={anexo.name} className="nova-demanda-anexo-item">
                    <span>{anexo.name}</span>

                    <button
                      type="button"
                      onClick={() => removerAnexo(anexo.name)}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <div className="nova-demanda-acoes">
            <button
              type="button"
              className="nova-demanda-cancelar"
              onClick={() => navigate("/demandas")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="nova-demanda-salvar"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar Demanda"}
            </button>
          </div>
        </form>
        </section>
      </main>
    </div>
  );
}

export default NovaDemanda;
