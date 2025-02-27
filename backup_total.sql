--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Drop databases (except postgres and template1)
--





--
-- Drop roles
--

DROP ROLE postgres;


--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:7WwY0kgHq2kXqowOX3VJ9A==$WIUVfeeS2u/6WxehmYpiSdLXcG3bFEWWz1icDAiIQ1I=:2CMxUn4bMBjGOJoap9v/r1gQ/efCpDP0ZO3/8Qd/rMk=';

--
-- User Configurations
--








--
-- Databases
--

--
-- Database "template1" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.3 (Debian 17.3-3.pgdg120+1)
-- Dumped by pg_dump version 17.3 (Debian 17.3-3.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

UPDATE pg_catalog.pg_database SET datistemplate = false WHERE datname = 'template1';
DROP DATABASE template1;
--
-- Name: template1; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE template1 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE template1 OWNER TO postgres;

\connect template1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE template1 IS 'default template for new databases';


--
-- Name: template1; Type: DATABASE PROPERTIES; Schema: -; Owner: postgres
--

ALTER DATABASE template1 IS_TEMPLATE = true;


\connect template1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: ACL; Schema: -; Owner: postgres
--

REVOKE CONNECT,TEMPORARY ON DATABASE template1 FROM PUBLIC;
GRANT CONNECT ON DATABASE template1 TO PUBLIC;


--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.3 (Debian 17.3-3.pgdg120+1)
-- Dumped by pg_dump version 17.3 (Debian 17.3-3.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE postgres OWNER TO postgres;

\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: postgres; Type: DATABASE PROPERTIES; Schema: -; Owner: postgres
--

ALTER DATABASE postgres SET "TimeZone" TO 'UTC';


\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: status_dungeon_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_dungeon_enum AS ENUM (
    'em_progresso',
    'finalizada',
    'cancelada',
    'aguardando_recompensa'
);


ALTER TYPE public.status_dungeon_enum OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: base_itens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.base_itens (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    categoria character varying(50) NOT NULL,
    descricao text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    slot character varying(50)
);


ALTER TABLE public.base_itens OWNER TO postgres;

--
-- Name: base_itens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.base_itens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.base_itens_id_seq OWNER TO postgres;

--
-- Name: base_itens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.base_itens_id_seq OWNED BY public.base_itens.id;


--
-- Name: batalhas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batalhas (
    id integer NOT NULL,
    tipo character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    vencedor_time integer,
    iniciada_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    finalizada_em timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.batalhas OWNER TO postgres;

--
-- Name: batalhas_diarias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batalhas_diarias (
    id integer NOT NULL,
    usuario_id integer,
    batalhas_restantes integer DEFAULT 5,
    ultima_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.batalhas_diarias OWNER TO postgres;

--
-- Name: batalhas_diarias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batalhas_diarias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.batalhas_diarias_id_seq OWNER TO postgres;

--
-- Name: batalhas_diarias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.batalhas_diarias_id_seq OWNED BY public.batalhas_diarias.id;


--
-- Name: batalhas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.batalhas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.batalhas_id_seq OWNER TO postgres;

--
-- Name: batalhas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.batalhas_id_seq OWNED BY public.batalhas.id;


--
-- Name: channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.channels (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    type character varying(20) NOT NULL
);


ALTER TABLE public.channels OWNER TO postgres;

--
-- Name: channels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.channels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.channels_id_seq OWNER TO postgres;

--
-- Name: channels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.channels_id_seq OWNED BY public.channels.id;


--
-- Name: dungeon_recompensas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dungeon_recompensas (
    id integer NOT NULL,
    dungeon_id integer NOT NULL,
    equipamento_id integer NOT NULL,
    coletado boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.dungeon_recompensas OWNER TO postgres;

--
-- Name: dungeon_recompensas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dungeon_recompensas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dungeon_recompensas_id_seq OWNER TO postgres;

--
-- Name: dungeon_recompensas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dungeon_recompensas_id_seq OWNED BY public.dungeon_recompensas.id;


--
-- Name: dungeons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dungeons (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo_dungeon_id integer NOT NULL,
    status public.status_dungeon_enum DEFAULT 'em_progresso'::public.status_dungeon_enum NOT NULL,
    iniciada_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    finalizada_em timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dungeons OWNER TO postgres;

--
-- Name: dungeons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dungeons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dungeons_id_seq OWNER TO postgres;

--
-- Name: dungeons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dungeons_id_seq OWNED BY public.dungeons.id;


--
-- Name: efeitos_batalha; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.efeitos_batalha (
    id integer NOT NULL,
    participante_id integer,
    tipo_efeito character varying(50) NOT NULL,
    valor integer,
    duracao integer,
    origem_usuario_id integer,
    origem_habilidade_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.efeitos_batalha OWNER TO postgres;

--
-- Name: efeitos_batalha_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.efeitos_batalha_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.efeitos_batalha_id_seq OWNER TO postgres;

--
-- Name: efeitos_batalha_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.efeitos_batalha_id_seq OWNED BY public.efeitos_batalha.id;


--
-- Name: equipamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipamentos (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    tipo character varying(50) NOT NULL,
    nivel integer NOT NULL,
    raridade character varying(50) NOT NULL,
    forca integer DEFAULT 0 NOT NULL,
    destreza integer DEFAULT 0 NOT NULL,
    inteligencia integer DEFAULT 0 NOT NULL,
    vitalidade integer DEFAULT 0 NOT NULL,
    defesa integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    slot character varying(50),
    forca_raridade character varying(50),
    destreza_raridade character varying(50),
    inteligencia_raridade character varying(50),
    vitalidade_raridade character varying(50),
    defesa_raridade character varying(50),
    sorte integer DEFAULT 0,
    sorte_raridade character varying(50) DEFAULT 'comum'::character varying
);


ALTER TABLE public.equipamentos OWNER TO postgres;

--
-- Name: equipamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipamentos_id_seq OWNER TO postgres;

--
-- Name: equipamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipamentos_id_seq OWNED BY public.equipamentos.id;


--
-- Name: habilidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habilidades (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    descricao text,
    tipo character varying(50) NOT NULL,
    classe character varying(50) NOT NULL,
    nivel_requisito integer NOT NULL,
    cooldown integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.habilidades OWNER TO postgres;

--
-- Name: habilidades_efeitos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habilidades_efeitos (
    id integer NOT NULL,
    habilidade_id integer,
    tipo_efeito character varying(50) NOT NULL,
    valor numeric NOT NULL,
    atributo_base character varying(50),
    duracao integer,
    chance numeric DEFAULT 100
);


ALTER TABLE public.habilidades_efeitos OWNER TO postgres;

--
-- Name: habilidades_efeitos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.habilidades_efeitos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habilidades_efeitos_id_seq OWNER TO postgres;

--
-- Name: habilidades_efeitos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.habilidades_efeitos_id_seq OWNED BY public.habilidades_efeitos.id;


--
-- Name: habilidades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.habilidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.habilidades_id_seq OWNER TO postgres;

--
-- Name: habilidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.habilidades_id_seq OWNED BY public.habilidades.id;


--
-- Name: inventario_equipamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventario_equipamentos (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    equipamento_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    visualizado boolean DEFAULT false
);


ALTER TABLE public.inventario_equipamentos OWNER TO postgres;

--
-- Name: inventario_equipamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventario_equipamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventario_equipamentos_id_seq OWNER TO postgres;

--
-- Name: inventario_equipamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventario_equipamentos_id_seq OWNED BY public.inventario_equipamentos.id;


--
-- Name: logs_batalha; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_batalha (
    id integer NOT NULL,
    batalha_id integer,
    turno integer NOT NULL,
    tipo_acao character varying(50) NOT NULL,
    usuario_origem integer,
    usuario_alvo integer,
    habilidade_id integer,
    dano integer,
    cura integer,
    efeitos jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    vida_alvo_pos_acao integer
);


ALTER TABLE public.logs_batalha OWNER TO postgres;

--
-- Name: logs_batalha_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_batalha_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_batalha_id_seq OWNER TO postgres;

--
-- Name: logs_batalha_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_batalha_id_seq OWNED BY public.logs_batalha.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    channel_id integer NOT NULL,
    sender_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: participantes_batalha; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participantes_batalha (
    id integer NOT NULL,
    time_id integer,
    usuario_id integer,
    posicao integer NOT NULL,
    vida_atual integer,
    mana_atual integer,
    status character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    vida_base integer,
    mana_base integer
);


ALTER TABLE public.participantes_batalha OWNER TO postgres;

--
-- Name: participantes_batalha_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.participantes_batalha_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.participantes_batalha_id_seq OWNER TO postgres;

--
-- Name: participantes_batalha_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.participantes_batalha_id_seq OWNED BY public.participantes_batalha.id;


--
-- Name: personagem_equipamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personagem_equipamentos (
    usuario_id integer NOT NULL,
    elmo_id integer,
    armadura_id integer,
    colar_id integer,
    anel_id integer,
    calcas_id integer,
    luvas_id integer,
    botas_id integer,
    arma_id integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.personagem_equipamentos OWNER TO postgres;

--
-- Name: personagem_skins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personagem_skins (
    usuario_id integer NOT NULL,
    skin_id integer NOT NULL,
    equipada boolean DEFAULT false
);


ALTER TABLE public.personagem_skins OWNER TO postgres;

--
-- Name: personagens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personagens (
    usuario_id integer NOT NULL,
    forca integer DEFAULT 10 NOT NULL,
    destreza integer DEFAULT 10 NOT NULL,
    inteligencia integer DEFAULT 10 NOT NULL,
    vitalidade integer DEFAULT 10 NOT NULL,
    sorte integer DEFAULT 10 NOT NULL,
    defesa integer DEFAULT 10 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    experiencia integer DEFAULT 0,
    classe character varying(50),
    nivel integer DEFAULT 1,
    xp_atual integer DEFAULT 0,
    prox_xp integer DEFAULT 100,
    vida integer,
    mana integer,
    elo character varying(20) DEFAULT 'Bronze'::character varying NOT NULL,
    pontos_arena integer DEFAULT 0 NOT NULL,
    CONSTRAINT check_classe CHECK (((classe)::text = ANY ((ARRAY['guerreiro'::character varying, 'mago'::character varying, 'ladino'::character varying, 'paladino'::character varying, 'cacador'::character varying, 'clerigo'::character varying, 'mercenario'::character varying, 'cavaleiro'::character varying])::text[])))
);


ALTER TABLE public.personagens OWNER TO postgres;

--
-- Name: personagens_habilidades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personagens_habilidades (
    id integer NOT NULL,
    usuario_id integer,
    habilidade_id integer,
    desbloqueada_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nivel_habilidade integer DEFAULT 1
);


ALTER TABLE public.personagens_habilidades OWNER TO postgres;

--
-- Name: personagens_habilidades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personagens_habilidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personagens_habilidades_id_seq OWNER TO postgres;

--
-- Name: personagens_habilidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personagens_habilidades_id_seq OWNED BY public.personagens_habilidades.id;


--
-- Name: skins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skins (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    classe character varying(50) NOT NULL,
    caminho_imagem character varying(200) NOT NULL,
    raridade character varying(20),
    preco integer,
    disponivel boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.skins OWNER TO postgres;

--
-- Name: skins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skins_id_seq OWNER TO postgres;

--
-- Name: skins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skins_id_seq OWNED BY public.skins.id;


--
-- Name: times_batalha; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.times_batalha (
    id integer NOT NULL,
    batalha_id integer,
    numero_time integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.times_batalha OWNER TO postgres;

--
-- Name: times_batalha_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.times_batalha_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.times_batalha_id_seq OWNER TO postgres;

--
-- Name: times_batalha_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.times_batalha_id_seq OWNED BY public.times_batalha.id;


--
-- Name: tipos_dungeon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_dungeon (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    nivel_minimo integer NOT NULL,
    nivel_maximo integer NOT NULL,
    tempo_espera integer NOT NULL,
    recompensa_tipo character varying(20) NOT NULL,
    xp_minimo integer NOT NULL,
    xp_maximo integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    xp_recompensa integer DEFAULT 50 NOT NULL
);


ALTER TABLE public.tipos_dungeon OWNER TO postgres;

--
-- Name: tipos_dungeon_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipos_dungeon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_dungeon_id_seq OWNER TO postgres;

--
-- Name: tipos_dungeon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_dungeon_id_seq OWNED BY public.tipos_dungeon.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    nickname character varying(50) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    coins integer DEFAULT 0,
    energia integer DEFAULT 100,
    conta_validada boolean DEFAULT false,
    is_vip boolean DEFAULT false,
    primeiro_login timestamp without time zone,
    ultimo_login timestamp without time zone,
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'ativo'::character varying NOT NULL,
    CONSTRAINT check_status CHECK (((status)::text = ANY ((ARRAY['ativo'::character varying, 'inativo'::character varying, 'banido'::character varying, 'pendente'::character varying, 'silenciado'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: base_itens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.base_itens ALTER COLUMN id SET DEFAULT nextval('public.base_itens_id_seq'::regclass);


--
-- Name: batalhas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batalhas ALTER COLUMN id SET DEFAULT nextval('public.batalhas_id_seq'::regclass);


--
-- Name: batalhas_diarias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batalhas_diarias ALTER COLUMN id SET DEFAULT nextval('public.batalhas_diarias_id_seq'::regclass);


--
-- Name: channels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels ALTER COLUMN id SET DEFAULT nextval('public.channels_id_seq'::regclass);


--
-- Name: dungeon_recompensas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dungeon_recompensas ALTER COLUMN id SET DEFAULT nextval('public.dungeon_recompensas_id_seq'::regclass);


--
-- Name: dungeons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dungeons ALTER COLUMN id SET DEFAULT nextval('public.dungeons_id_seq'::regclass);


--
-- Name: efeitos_batalha id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.efeitos_batalha ALTER COLUMN id SET DEFAULT nextval('public.efeitos_batalha_id_seq'::regclass);


--
-- Name: equipamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipamentos ALTER COLUMN id SET DEFAULT nextval('public.equipamentos_id_seq'::regclass);


--
-- Name: habilidades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidades ALTER COLUMN id SET DEFAULT nextval('public.habilidades_id_seq'::regclass);


--
-- Name: habilidades_efeitos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidades_efeitos ALTER COLUMN id SET DEFAULT nextval('public.habilidades_efeitos_id_seq'::regclass);


--
-- Name: inventario_equipamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_equipamentos ALTER COLUMN id SET DEFAULT nextval('public.inventario_equipamentos_id_seq'::regclass);


--
-- Name: logs_batalha id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_batalha ALTER COLUMN id SET DEFAULT nextval('public.logs_batalha_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: participantes_batalha id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_batalha ALTER COLUMN id SET DEFAULT nextval('public.participantes_batalha_id_seq'::regclass);


--
-- Name: personagens_habilidades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagens_habilidades ALTER COLUMN id SET DEFAULT nextval('public.personagens_habilidades_id_seq'::regclass);


--
-- Name: skins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skins ALTER COLUMN id SET DEFAULT nextval('public.skins_id_seq'::regclass);


--
-- Name: times_batalha id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.times_batalha ALTER COLUMN id SET DEFAULT nextval('public.times_batalha_id_seq'::regclass);


--
-- Name: tipos_dungeon id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_dungeon ALTER COLUMN id SET DEFAULT nextval('public.tipos_dungeon_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: base_itens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.base_itens (id, nome, categoria, descricao, created_at, updated_at, slot) FROM stdin;
1	Espada Longa	equipamento	Uma espada robusta para her├│is de guerra.	2025-02-16 02:39:57.079013	2025-02-16 02:39:57.079013	arma
2	Elmo de Ferro	equipamento	Protege a cabe├ºa, ideal para guerreiros em combate.	2025-02-16 02:39:57.079013	2025-02-16 02:39:57.079013	elmo
3	Armadura de Couro	equipamento	Prote├º├úo leve que favorece a agilidade.	2025-02-16 02:39:57.079013	2025-02-16 02:39:57.079013	armadura
4	Po├º├úo de Vida	consumivel	Restaura uma quantidade moderada de vida.	2025-02-16 02:39:57.079013	2025-02-16 02:39:57.079013	consumivel
6	Cal├ºas do Rock Lee	equipamento	Uma cal├ºa que contem o poder da juventude	2025-02-16 02:39:57.079013	2025-02-16 02:39:57.079013	calca
7	Colar de Couro	equipamento	Um colar que oferece atributos de uma lenda	2025-02-16 02:39:57.079013	2025-02-16 02:39:57.079013	colar
8	Luvas de Ferro	equipamento	Pertenceu ao um soldado na era medieval	2025-02-16 02:39:57.079013	2025-02-16 02:39:57.079013	luvas
9	Sapatos do Rock Lee	equipamento	Retire os pesos e sentira o poder da juventude	2025-02-16 02:39:57.079013	2025-02-16 02:39:57.079013	botas
5	Anel da Sorte	equipamento	Um anel que aumenta ligeiramente a sorte do portador.	2025-02-16 02:39:57.079013	2025-02-16 02:39:57.079013	anel
\.


--
-- Data for Name: batalhas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batalhas (id, tipo, status, vencedor_time, iniciada_em, finalizada_em, created_at, updated_at) FROM stdin;
113	1v1	finalizada	2	2025-02-19 20:17:33.375058	2025-02-19 20:17:33.765917	2025-02-19 20:17:33.375058	2025-02-19 20:17:33.375058
114	1v1	em_progresso	\N	2025-02-19 20:51:07.723124	\N	2025-02-19 20:51:07.723124	2025-02-19 20:51:07.723124
115	1v1	finalizada	2	2025-02-19 21:04:18.54862	2025-02-19 21:04:18.872095	2025-02-19 21:04:18.54862	2025-02-19 21:04:18.54862
116	1v1	finalizada	2	2025-02-19 21:07:58.407235	2025-02-19 21:07:58.745486	2025-02-19 21:07:58.407235	2025-02-19 21:07:58.407235
117	1v1	finalizada	2	2025-02-19 21:12:04.939922	2025-02-19 21:12:05.366132	2025-02-19 21:12:04.939922	2025-02-19 21:12:04.939922
\.


--
-- Data for Name: batalhas_diarias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.batalhas_diarias (id, usuario_id, batalhas_restantes, ultima_atualizacao) FROM stdin;
4	8	2	2025-02-19 01:54:53.291933
3	7	67	2025-02-19 01:44:47.190388
\.


--
-- Data for Name: channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.channels (id, name, type) FROM stdin;
1	World Chat	world
2	Trade Chat	trade
\.


--
-- Data for Name: dungeon_recompensas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dungeon_recompensas (id, dungeon_id, equipamento_id, coletado, created_at) FROM stdin;
97	73	100	t	2025-02-19 02:13:06.920637
98	73	101	t	2025-02-19 02:13:06.920637
99	74	102	t	2025-02-19 02:14:57.00942
100	74	103	t	2025-02-19 02:14:57.00942
101	74	104	t	2025-02-19 02:14:57.00942
102	75	105	t	2025-02-19 04:38:44.555018
103	75	106	t	2025-02-19 04:38:44.555018
104	76	107	t	2025-02-19 11:54:47.618288
107	78	110	t	2025-02-19 12:48:56.625216
108	79	111	t	2025-02-19 14:34:02.197563
109	80	112	f	2025-02-19 18:19:57.837429
105	77	108	t	2025-02-19 11:58:28.517783
106	77	109	t	2025-02-19 11:58:28.517783
110	81	113	f	2025-02-19 20:39:43.358117
\.


--
-- Data for Name: dungeons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dungeons (id, usuario_id, tipo_dungeon_id, status, iniciada_em, finalizada_em, created_at, updated_at) FROM stdin;
73	7	1	finalizada	2025-02-19 01:43:01.751052	2025-02-19 02:13:06.920637	2025-02-19 01:43:01.751052	2025-02-19 04:08:38.165739
74	8	1	finalizada	2025-02-19 01:44:48.521908	2025-02-19 02:14:57.00942	2025-02-19 01:44:48.521908	2025-02-19 11:24:26.387538
75	7	1	finalizada	2025-02-19 04:08:42.426348	2025-02-19 04:38:44.555018	2025-02-19 04:08:42.426348	2025-02-19 11:28:22.896977
76	8	1	finalizada	2025-02-19 11:24:44.983947	2025-02-19 11:54:47.618288	2025-02-19 11:24:44.983947	2025-02-19 12:18:45.389199
78	8	1	finalizada	2025-02-19 12:18:54.626133	2025-02-19 12:48:56.625216	2025-02-19 12:18:54.626133	2025-02-19 14:03:50.129746
79	8	1	finalizada	2025-02-19 14:03:57.140455	2025-02-19 14:34:02.197563	2025-02-19 14:03:57.140455	2025-02-19 17:49:27.793965
80	8	1	aguardando_recompensa	2025-02-19 17:49:51.778453	2025-02-19 18:19:57.837429	2025-02-19 17:49:51.778453	2025-02-19 18:19:57.837429
77	7	1	finalizada	2025-02-19 11:28:28.233441	2025-02-19 11:58:28.517783	2025-02-19 11:28:28.233441	2025-02-19 20:09:33.408079
81	7	1	aguardando_recompensa	2025-02-19 20:09:35.876622	2025-02-19 20:39:43.358117	2025-02-19 20:09:35.876622	2025-02-19 20:39:43.358117
\.


--
-- Data for Name: efeitos_batalha; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.efeitos_batalha (id, participante_id, tipo_efeito, valor, duracao, origem_usuario_id, origem_habilidade_id, created_at) FROM stdin;
\.


--
-- Data for Name: equipamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipamentos (id, nome, tipo, nivel, raridade, forca, destreza, inteligencia, vitalidade, defesa, created_at, updated_at, slot, forca_raridade, destreza_raridade, inteligencia_raridade, vitalidade_raridade, defesa_raridade, sorte, sorte_raridade) FROM stdin;
100	Armadura de Couro	equipamento	1	comum	0	0	0	5	20	2025-02-19 02:13:06.947107	2025-02-19 02:13:06.947107	armadura	comum	comum	comum	comum	lendario	0	comum
101	Anel da Sorte	equipamento	1	epico	0	0	7	0	0	2025-02-19 02:13:06.964922	2025-02-19 02:13:06.964922	anel	comum	comum	comum	comum	comum	10	comum
102	Po├º├úo de Vida	consumivel	1	comum	0	0	0	0	0	2025-02-19 02:14:57.032365	2025-02-19 02:14:57.032365	consumivel	comum	comum	comum	comum	comum	0	comum
103	Espada Longa	equipamento	1	comum	7	5	0	0	0	2025-02-19 02:14:57.046533	2025-02-19 02:14:57.046533	arma	comum	comum	comum	comum	comum	0	comum
104	Luvas de Ferro	equipamento	1	comum	4	6	0	0	0	2025-02-19 02:14:57.048551	2025-02-19 02:14:57.048551	luvas	comum	comum	comum	comum	comum	0	comum
105	Elmo de Ferro	equipamento	1	incomum	0	0	8	6	0	2025-02-19 04:38:44.57802	2025-02-19 04:38:44.57802	elmo	comum	comum	comum	incomum	comum	0	comum
106	Anel da Sorte	equipamento	1	comum	0	0	5	0	0	2025-02-19 04:38:44.593418	2025-02-19 04:38:44.593418	anel	comum	comum	incomum	comum	comum	8	raro
107	Elmo de Ferro	equipamento	1	incomum	0	0	8	8	3	2025-02-19 11:54:47.640183	2025-02-19 11:54:47.640183	elmo	comum	comum	comum	raro	comum	0	comum
108	Po├º├úo de Vida	consumivel	1	comum	0	0	0	0	0	2025-02-19 11:58:28.544612	2025-02-19 11:58:28.544612	consumivel	comum	comum	comum	comum	comum	0	comum
109	Armadura de Couro	equipamento	1	comum	0	0	0	10	8	2025-02-19 11:58:28.56117	2025-02-19 11:58:28.56117	armadura	comum	comum	comum	epico	comum	0	comum
110	Espada Longa	equipamento	1	comum	7	6	0	0	0	2025-02-19 12:48:56.655182	2025-02-19 12:48:56.655182	arma	comum	incomum	comum	comum	comum	0	comum
111	Espada Longa	equipamento	1	comum	7	5	0	0	0	2025-02-19 14:34:02.228136	2025-02-19 14:34:02.228136	arma	comum	comum	comum	comum	comum	0	comum
112	Colar de Couro	equipamento	1	comum	0	0	5	0	0	2025-02-19 18:19:57.865656	2025-02-19 18:19:57.865656	colar	comum	comum	comum	comum	comum	4	comum
113	Luvas de Ferro	equipamento	1	raro	5	18	4	0	0	2025-02-19 20:39:43.38836	2025-02-19 20:39:43.38836	luvas	comum	epico	comum	comum	comum	0	comum
\.


--
-- Data for Name: habilidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.habilidades (id, nome, descricao, tipo, classe, nivel_requisito, cooldown, created_at, updated_at) FROM stdin;
1	Golpe Circular	Um poderoso golpe circular que causa dano e tem chance de atordoar o inimigo	ataque	guerreiro	5	3	2025-02-18 15:56:31.39344	2025-02-18 15:56:31.39344
2	Postura Defensiva	Aumenta sua defesa e reflete parte do dano recebido	defesa	guerreiro	10	4	2025-02-18 15:56:31.39344	2025-02-18 15:56:31.39344
3	Grito de Guerra	Aumenta sua for├ºa e intimida o inimigo	buff	guerreiro	15	4	2025-02-18 15:56:31.39344	2025-02-18 15:56:31.39344
4	Proj├®til Arcano	Dispara um proj├®til de energia m├ígica que ignora parte da resist├¬ncia	ataque	mago	5	3	2025-02-18 15:57:01.326718	2025-02-18 15:57:01.326718
5	Barreira M├ígica	Cria uma barreira que absorve dano	defesa	mago	10	4	2025-02-18 15:57:01.326718	2025-02-18 15:57:01.326718
6	Explos├úo Elemental	Causa dano em ├írea com efeito elemental aleat├│rio	ataque	mago	15	5	2025-02-18 15:57:01.326718	2025-02-18 15:57:01.326718
7	Ataque Furtivo	Ataque poderoso pelas costas com alta chance de cr├¡tico	ataque	ladino	5	3	2025-02-18 15:57:11.018749	2025-02-18 15:57:11.018749
8	Evas├úo	Aumenta drasticamente a chance de esquiva	defesa	ladino	10	4	2025-02-18 15:57:11.018749	2025-02-18 15:57:11.018749
9	Golpe Venenoso	Aplica veneno que causa dano ao longo do tempo	ataque	ladino	15	4	2025-02-18 15:57:11.018749	2025-02-18 15:57:11.018749
10	Julgamento Divino	Ataque sagrado que cura baseado no dano causado	ataque	paladino	5	3	2025-02-18 15:57:20.870317	2025-02-18 15:57:20.870317
11	B├¬n├º├úo Sagrada	Cura e aumenta a defesa do alvo	cura	paladino	10	4	2025-02-18 15:57:20.870317	2025-02-18 15:57:20.870317
12	Aura de Prote├º├úo	Reduz o dano recebido por todos aliados pr├│ximos	defesa	paladino	15	5	2025-02-18 15:57:20.870317	2025-02-18 15:57:20.870317
13	Tiro Certeiro	Disparo preciso com alta chance de acerto cr├¡tico	ataque	cacador	5	3	2025-02-18 16:00:36.475673	2025-02-18 16:00:36.475673
14	Armadilha	Prepara uma armadilha que imobiliza e causa dano cont├¡nuo	controle	cacador	10	4	2025-02-18 16:00:36.475673	2025-02-18 16:00:36.475673
15	Disparo M├║ltiplo	Dispara v├írias flechas em alvos aleat├│rios	ataque	cacador	15	4	2025-02-18 16:00:36.475673	2025-02-18 16:00:36.475673
16	Cura Divina	Poderosa cura que remove efeitos negativos	cura	clerigo	5	3	2025-02-18 16:00:46.082571	2025-02-18 16:00:46.082571
17	Martelo Sagrado	Ataque sagrado com chance de atordoamento	ataque	clerigo	10	4	2025-02-18 16:00:46.082571	2025-02-18 16:00:46.082571
18	Palavra Sagrada	Cura em ├írea e fornece prote├º├úo aos aliados	cura	clerigo	15	5	2025-02-18 16:00:46.082571	2025-02-18 16:00:46.082571
19	Golpe Oportunista	Ataque com chance de golpe duplo	ataque	mercenario	5	3	2025-02-18 16:00:49.67154	2025-02-18 16:00:49.67154
20	Provoca├º├úo	For├ºa o alvo a atacar e aumenta esquiva	controle	mercenario	10	4	2025-02-18 16:00:49.67154	2025-02-18 16:00:49.67154
21	├Ültimo Recurso	Aumenta temporariamente todos os atributos	buff	mercenario	15	6	2025-02-18 16:00:49.67154	2025-02-18 16:00:49.67154
22	Investida	Ataque poderoso que empurra o alvo	ataque	cavaleiro	5	3	2025-02-18 16:00:52.735312	2025-02-18 16:00:52.735312
23	Escudo Protetor	Bloqueia pr├│ximo ataque e contra-ataca	defesa	cavaleiro	10	4	2025-02-18 16:00:52.735312	2025-02-18 16:00:52.735312
24	Forma├º├úo Defensiva	Aumenta defesa pr├│pria e protege aliados	defesa	cavaleiro	15	5	2025-02-18 16:00:52.735312	2025-02-18 16:00:52.735312
\.


--
-- Data for Name: habilidades_efeitos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.habilidades_efeitos (id, habilidade_id, tipo_efeito, valor, atributo_base, duracao, chance) FROM stdin;
1	1	dano	140	forca	\N	100
2	1	atordoar	30	\N	1	30
3	2	buff_defesa	40	\N	2	100
4	2	reflexao_dano	20	\N	2	100
5	3	buff_forca	25	\N	2	100
6	3	debuff_ataque	15	\N	2	100
7	4	dano	180	inteligencia	\N	100
8	4	penetracao_magica	30	\N	\N	100
9	5	escudo_magico	100	inteligencia	2	100
10	6	dano_area	150	inteligencia	\N	100
11	6	efeito_elemental	30	\N	2	100
12	7	dano	200	destreza	\N	100
13	7	bonus_critico	30	\N	\N	100
14	8	buff_esquiva	60	\N	1	100
15	8	contra_ataque	50	destreza	\N	30
16	9	dano	120	destreza	\N	100
17	9	veneno	20	destreza	3	100
18	10	dano	160	forca	\N	100
19	10	cura	20	\N	\N	100
20	11	cura	100	vitalidade	\N	100
21	11	buff_defesa	25	\N	2	100
22	12	reducao_dano	30	\N	3	100
28	13	dano	180	destreza	\N	100
29	13	bonus_critico	40	\N	\N	100
30	14	imobilizar	100	\N	1	100
31	14	dano_tempo	30	destreza	3	100
32	15	dano_multiplo	70	destreza	\N	100
33	15	alvos_adicionais	3	\N	\N	100
34	16	cura	150	inteligencia	\N	100
35	16	remover_efeito	100	\N	\N	100
36	17	dano	140	forca	\N	100
37	17	atordoar	40	\N	1	40
38	18	cura_area	100	inteligencia	\N	100
39	18	buff_defesa_grupo	25	\N	2	100
40	19	dano	160	forca	\N	100
41	19	golpe_duplo	40	\N	\N	40
42	20	provocar	100	\N	2	100
43	20	buff_esquiva	30	\N	2	100
44	21	buff_todos_atributos	30	\N	2	100
45	22	dano	150	forca	\N	100
46	22	empurrar	100	\N	\N	100
47	23	bloqueio	100	\N	1	100
49	24	buff_defesa	50	\N	2	100
50	24	protecao_aliados	25	\N	2	100
\.


--
-- Data for Name: inventario_equipamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventario_equipamentos (id, usuario_id, equipamento_id, created_at, updated_at, visualizado) FROM stdin;
92	7	100	2025-02-19 04:08:38.165739	2025-02-19 04:08:38.165739	t
93	7	101	2025-02-19 04:08:38.165739	2025-02-19 04:08:38.165739	t
94	8	102	2025-02-19 11:24:26.387538	2025-02-19 11:24:26.387538	f
95	8	103	2025-02-19 11:24:26.387538	2025-02-19 11:24:26.387538	t
96	8	104	2025-02-19 11:24:26.387538	2025-02-19 11:24:26.387538	t
97	7	105	2025-02-19 11:28:22.896977	2025-02-19 11:28:22.896977	t
98	7	106	2025-02-19 11:28:22.896977	2025-02-19 11:28:22.896977	t
99	8	107	2025-02-19 12:18:45.389199	2025-02-19 12:18:45.389199	t
100	8	110	2025-02-19 14:03:50.129746	2025-02-19 14:03:50.129746	t
101	8	111	2025-02-19 17:49:27.793965	2025-02-19 17:49:27.793965	f
103	7	109	2025-02-19 20:09:33.408079	2025-02-19 20:09:33.408079	t
102	7	108	2025-02-19 20:09:33.408079	2025-02-19 20:09:33.408079	t
\.


--
-- Data for Name: logs_batalha; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_batalha (id, batalha_id, turno, tipo_acao, usuario_origem, usuario_alvo, habilidade_id, dano, cura, efeitos, created_at, vida_alvo_pos_acao) FROM stdin;
2420	113	19	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 20:17:33.707766	27
2381	113	1	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 20:17:33.399827	216
2405	113	11	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 20:17:33.598534	116
2382	113	1	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.413814	223
2383	113	1	ataque	7	8	\N	0	0	{}	2025-02-19 20:17:33.420094	213
2406	113	12	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 20:17:33.60567	96
2384	113	2	ataque	8	7	\N	19	0	{}	2025-02-19 20:17:33.4281	201
2385	113	2	habilidade	8	7	1	0	0	{}	2025-02-19 20:17:33.435542	182
2386	113	2	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.445433	203
2387	113	3	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 20:17:33.454521	169
2407	113	12	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 20:17:33.61417	116
2388	113	3	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 20:17:33.462823	194
2389	113	4	habilidade	8	7	10	22	20	{}	2025-02-19 20:17:33.472615	167
2421	113	19	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 20:17:33.715711	50
2408	113	13	ataque	8	7	\N	12	0	{"critico": false}	2025-02-19 20:17:33.620389	84
2390	113	4	habilidade	7	8	23	10	0	{"critico": false}	2025-02-19 20:17:33.481116	194
2391	113	4	ataque	7	8	\N	0	0	{}	2025-02-19 20:17:33.486685	184
2392	113	5	habilidade	8	7	10	22	20	{}	2025-02-19 20:17:33.495665	165
2393	113	5	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.502889	174
2409	113	13	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 20:17:33.628743	107
2394	113	6	ataque	8	7	\N	15	0	{"critico": false}	2025-02-19 20:17:33.511427	150
2395	113	6	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 20:17:33.520297	165
2430	115	1	ataque	8	7	\N	19	0	{}	2025-02-19 21:04:18.582374	216
2396	113	7	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 20:17:33.527755	137
2410	113	14	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 20:17:33.635537	71
2397	113	7	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.536211	155
2398	113	8	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 20:17:33.544222	124
2422	113	20	habilidade	8	7	10	22	20	{}	2025-02-19 20:17:33.722835	25
2399	113	8	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.552331	145
2411	113	14	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.642544	97
2400	113	9	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 20:17:33.560664	111
2401	113	9	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.568469	135
2402	113	10	ataque	8	7	\N	0	0	{}	2025-02-19 20:17:33.575632	111
2412	113	15	habilidade	8	7	10	22	20	{}	2025-02-19 20:17:33.65034	69
2403	113	10	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.583612	125
2404	113	11	habilidade	8	7	10	22	20	{}	2025-02-19 20:17:33.591637	109
2431	115	1	habilidade	8	7	1	0	0	{}	2025-02-19 21:04:18.601017	197
2413	113	15	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 20:17:33.657188	88
2423	113	20	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.72945	40
2414	113	16	habilidade	8	7	10	22	20	{}	2025-02-19 20:17:33.664965	67
2415	113	16	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.672358	78
2416	113	17	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 20:17:33.679362	54
2424	113	21	ataque	8	7	\N	12	0	{"critico": false}	2025-02-19 20:17:33.736852	13
2417	113	17	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 20:17:33.68676	69
2418	113	18	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 20:17:33.693399	40
2443	115	6	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:04:18.7098	184
2419	113	18	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 20:17:33.700565	59
2432	115	1	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:04:18.610277	222
2425	113	21	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 20:17:33.744889	31
2426	113	22	habilidade	8	7	10	22	20	{}	2025-02-19 20:17:33.752185	11
2427	113	22	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 20:17:33.758766	22
2433	115	2	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:04:18.619209	183
2428	113	23	ataque	8	7	\N	15	0	{"critico": false}	2025-02-19 20:17:33.765917	0
2437	115	4	ataque	8	7	\N	19	0	{}	2025-02-19 21:04:18.655883	154
2438	115	4	habilidade	8	7	1	0	0	{}	2025-02-19 21:04:18.663155	135
2434	115	2	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:04:18.628555	213
2435	115	3	ataque	8	7	\N	15	0	{"critico": false}	2025-02-19 21:04:18.637555	168
2441	115	5	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:04:18.691634	194
2436	115	3	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:04:18.647137	203
2439	115	4	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:04:18.670679	194
2440	115	5	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 21:04:18.679807	122
2442	115	6	ataque	8	7	\N	15	0	{"critico": false}	2025-02-19 21:04:18.700407	107
2444	115	7	ataque	8	7	\N	18	0	{"critico": true}	2025-02-19 21:04:18.717732	89
2445	115	7	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:04:18.726648	174
2446	115	8	habilidade	8	7	10	22	20	{}	2025-02-19 21:04:18.735642	87
2447	115	8	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:04:18.743017	165
2448	115	9	ataque	8	7	\N	12	0	{"critico": false}	2025-02-19 21:04:18.751364	75
2449	115	9	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:04:18.759723	155
2450	115	10	habilidade	8	7	10	22	20	{}	2025-02-19 21:04:18.768008	73
2451	115	10	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:04:18.775973	155
2452	115	11	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 21:04:18.783284	60
2453	115	11	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:04:18.791529	145
2454	115	12	habilidade	8	7	10	22	20	{}	2025-02-19 21:04:18.8013	58
2491	116	13	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 21:07:58.695107	38
2455	115	12	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:04:18.809056	145
2477	116	7	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:07:58.574436	189
2456	115	13	ataque	8	7	\N	12	0	{"critico": false}	2025-02-19 21:04:18.816202	46
2457	115	13	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:04:18.825158	145
2458	115	14	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 21:04:18.832055	33
2459	115	14	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:04:18.840673	136
2460	115	15	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 21:04:18.848886	20
2478	116	7	ataque	8	7	\N	19	0	{}	2025-02-19 21:07:58.583823	130
2461	115	15	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:04:18.857012	127
2479	116	7	habilidade	8	7	1	0	0	{}	2025-02-19 21:07:58.591325	111
2462	115	16	ataque	8	7	\N	19	0	{}	2025-02-19 21:04:18.864916	6
2463	115	16	habilidade	8	7	1	0	0	{}	2025-02-19 21:04:18.872095	0
2492	116	14	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:07:58.703351	142
2464	116	1	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:07:58.44756	232
2480	116	8	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:07:58.599157	179
2465	116	1	ataque	8	7	\N	12	0	{"critico": false}	2025-02-19 21:07:58.464088	218
2466	116	2	ataque	7	8	\N	15	0	{"critico": true}	2025-02-19 21:07:58.477691	217
2467	116	2	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 21:07:58.486686	205
2481	116	8	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:07:58.607739	97
2468	116	3	ataque	7	8	\N	0	0	{}	2025-02-19 21:07:58.496052	217
2469	116	3	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:07:58.504	191
2500	117	2	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:12:04.99056	222
2470	116	4	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:07:58.513246	208
2482	116	9	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:07:58.617078	170
2471	116	4	ataque	8	7	\N	0	0	{}	2025-02-19 21:07:58.522232	191
2472	116	5	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:07:58.530877	199
2493	116	14	ataque	8	7	\N	12	0	{"critico": false}	2025-02-19 21:07:58.711777	26
2483	116	9	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:07:58.625532	83
2473	116	5	ataque	8	7	\N	19	0	{}	2025-02-19 21:07:58.539836	178
2474	116	5	habilidade	8	7	1	0	0	{}	2025-02-19 21:07:58.547571	159
2475	116	6	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:07:58.557265	199
2476	116	6	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:07:58.56536	145
2484	116	10	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:07:58.635214	170
2485	116	10	ataque	8	7	\N	0	0	{}	2025-02-19 21:07:58.642624	83
2494	116	15	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:07:58.72151	142
2486	116	11	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:07:58.650727	160
2487	116	11	ataque	8	7	\N	19	0	{"critico": true}	2025-02-19 21:07:58.659367	64
2488	116	12	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:07:58.66926	160
2495	116	15	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:07:58.728415	12
2489	116	12	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 21:07:58.677168	51
2490	116	13	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:07:58.685986	151
2501	117	2	habilidade	8	7	10	22	20	{}	2025-02-19 21:12:04.999566	215
2496	116	16	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:07:58.737097	133
2506	117	5	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.046859	195
2497	116	16	ataque	8	7	\N	15	0	{"critico": false}	2025-02-19 21:07:58.745486	0
2502	117	3	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.0082	213
2498	117	1	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:12:04.960976	222
2499	117	1	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 21:12:04.97451	217
2503	117	3	habilidade	8	7	10	22	20	{}	2025-02-19 21:12:05.018485	213
2513	117	8	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:12:05.116185	141
2504	117	4	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.027499	204
2507	117	5	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:12:05.055794	184
2505	117	4	ataque	8	7	\N	15	0	{"critico": false}	2025-02-19 21:12:05.036865	198
2510	117	7	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.08672	176
2508	117	6	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:12:05.06695	185
2509	117	6	ataque	8	7	\N	15	0	{"critico": false}	2025-02-19 21:12:05.077086	169
2512	117	8	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.106634	167
2511	117	7	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:12:05.097126	155
2514	117	9	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.125788	158
2515	117	9	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 21:12:05.135039	128
2516	117	10	ataque	7	8	\N	15	0	{"critico": true}	2025-02-19 21:12:05.144592	143
2517	117	10	habilidade	8	7	10	22	20	{}	2025-02-19 21:12:05.154898	126
2518	117	11	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.163538	134
2519	117	11	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:12:05.172679	112
2520	117	12	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.181935	125
2521	117	12	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:12:05.191464	98
2522	117	13	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.201064	116
2523	117	13	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:12:05.210787	84
2524	117	14	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:12:05.220233	116
2525	117	14	habilidade	8	7	10	22	20	{}	2025-02-19 21:12:05.228534	82
2526	117	15	ataque	7	8	\N	0	0	{}	2025-02-19 21:12:05.236509	116
2527	117	15	ataque	8	7	\N	15	0	{"critico": false}	2025-02-19 21:12:05.244157	67
2528	117	16	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:12:05.253707	106
2529	117	16	ataque	8	7	\N	0	0	{}	2025-02-19 21:12:05.262403	67
2530	117	17	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.271061	97
2531	117	17	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:12:05.279874	53
2532	117	18	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:12:05.290103	87
2533	117	18	ataque	8	7	\N	14	0	{"critico": false}	2025-02-19 21:12:05.298016	39
2534	117	19	ataque	7	8	\N	10	0	{"critico": false}	2025-02-19 21:12:05.306513	77
2535	117	19	ataque	8	7	\N	12	0	{"critico": false}	2025-02-19 21:12:05.315217	27
2536	117	20	habilidade	7	8	23	0	0	{"bloqueio": {"valor": "100", "duracao": 1}}	2025-02-19 21:12:05.324213	77
2537	117	20	ataque	8	7	\N	12	0	{"critico": false}	2025-02-19 21:12:05.331257	15
2538	117	21	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.339675	68
2539	117	21	ataque	8	7	\N	13	0	{"critico": false}	2025-02-19 21:12:05.348256	2
2540	117	22	ataque	7	8	\N	9	0	{"critico": false}	2025-02-19 21:12:05.356784	59
2541	117	22	habilidade	8	7	10	22	20	{}	2025-02-19 21:12:05.366132	0
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, channel_id, sender_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: participantes_batalha; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.participantes_batalha (id, time_id, usuario_id, posicao, vida_atual, mana_atual, status, created_at, vida_base, mana_base) FROM stdin;
230	232	8	1	133	172	vivo	2025-02-19 21:07:58.407235	232	172
229	231	7	1	0	125	morto	2025-02-19 21:07:58.407235	230	125
224	226	8	1	22	172	vivo	2025-02-19 20:17:33.375058	232	172
223	225	7	1	0	125	morto	2025-02-19 20:17:33.375058	230	125
225	227	7	1	230	125	vivo	2025-02-19 20:51:07.723124	230	125
226	228	8	1	232	172	vivo	2025-02-19 20:51:07.723124	232	172
232	234	8	1	59	172	vivo	2025-02-19 21:12:04.939922	232	172
231	233	7	1	0	125	morto	2025-02-19 21:12:04.939922	230	125
228	230	8	1	127	172	vivo	2025-02-19 21:04:18.54862	232	172
227	229	7	1	0	125	morto	2025-02-19 21:04:18.54862	230	125
\.


--
-- Data for Name: personagem_equipamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personagem_equipamentos (usuario_id, elmo_id, armadura_id, colar_id, anel_id, calcas_id, luvas_id, botas_id, arma_id, updated_at) FROM stdin;
7	\N	100	\N	101	\N	\N	\N	\N	2025-02-19 11:32:04.376474
8	107	\N	\N	\N	\N	104	\N	110	2025-02-19 14:04:11.796357
\.


--
-- Data for Name: personagem_skins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personagem_skins (usuario_id, skin_id, equipada) FROM stdin;
\.


--
-- Data for Name: personagens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personagens (usuario_id, forca, destreza, inteligencia, vitalidade, sorte, defesa, created_at, updated_at, experiencia, classe, nivel, xp_atual, prox_xp, vida, mana, elo, pontos_arena) FROM stdin;
8	14	9	12	14	9	18	2025-02-19 01:44:44.172178	2025-02-19 17:49:27.831348	0	paladino	2	20	200	232	172	Bronze	0
7	12	8	8	12	8	15	2025-02-19 01:42:54.087146	2025-02-19 20:09:33.443912	0	cavaleiro	1	90	100	230	125	Bronze	0
\.


--
-- Data for Name: personagens_habilidades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personagens_habilidades (id, usuario_id, habilidade_id, desbloqueada_em, nivel_habilidade) FROM stdin;
1	7	23	2025-02-19 01:42:54.087146	1
3	8	10	2025-02-19 01:42:54.087146	1
\.


--
-- Data for Name: skins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skins (id, nome, classe, caminho_imagem, raridade, preco, disponivel, created_at) FROM stdin;
1	Guerreiro Padr├úo	guerreiro	default/guerreiro	comum	0	t	2025-02-19 03:15:22.540176
2	Mago Padr├úo	mago	default/mago	comum	0	t	2025-02-19 03:15:22.540176
3	Ladino Padr├úo	ladino	default/ladino	comum	0	t	2025-02-19 03:15:22.540176
4	Paladino Padr├úo	paladino	default/paladino	comum	0	t	2025-02-19 03:15:22.540176
5	Ca├ºador Padr├úo	cacador	default/cacador	comum	0	t	2025-02-19 03:15:22.540176
6	Cl├®rigo Padr├úo	clerigo	default/clerigo	comum	0	t	2025-02-19 03:15:22.540176
7	Mercen├írio Padr├úo	mercenario	default/mercenario	comum	0	t	2025-02-19 03:15:22.540176
8	Cavaleiro Padr├úo	cavaleiro	default/cavaleiro	comum	0	t	2025-02-19 03:15:22.540176
\.


--
-- Data for Name: times_batalha; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.times_batalha (id, batalha_id, numero_time, created_at) FROM stdin;
225	113	1	2025-02-19 20:17:33.375058
226	113	2	2025-02-19 20:17:33.375058
227	114	1	2025-02-19 20:51:07.723124
228	114	2	2025-02-19 20:51:07.723124
229	115	1	2025-02-19 21:04:18.54862
230	115	2	2025-02-19 21:04:18.54862
231	116	1	2025-02-19 21:07:58.407235
232	116	2	2025-02-19 21:07:58.407235
233	117	1	2025-02-19 21:12:04.939922
234	117	2	2025-02-19 21:12:04.939922
\.


--
-- Data for Name: tipos_dungeon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_dungeon (id, nome, nivel_minimo, nivel_maximo, tempo_espera, recompensa_tipo, xp_minimo, xp_maximo, created_at, updated_at, xp_recompensa) FROM stdin;
1	Floresta Sagrada	1	20	30	baixa	100	150	2025-02-15 13:39:02.234619	2025-02-17 21:56:14.032815	30
2	Caverna dos Lobos	21	50	60	media	200	350	2025-02-15 13:39:02.234619	2025-02-17 21:56:24.195372	80
3	Castelo Assombrado	51	80	90	alta	400	600	2025-02-15 13:39:02.234619	2025-02-17 21:56:27.809882	150
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, email, nickname, senha_hash, coins, energia, conta_validada, is_vip, primeiro_login, ultimo_login, role, created_at, updated_at, status) FROM stdin;
7	msteus@hotmail.com	Mateuslapa	$2b$10$ZOQDfvvCeX59sT42ouRlQ.wklKzKIqmF9WPKUG8zXElQ4F4iRat46	0	100	f	f	\N	\N	user	2025-02-19 01:42:54.080507	2025-02-19 01:42:54.080507	ativo
8	emilly.araujob@gmail.com	Emily	$2b$10$R/gbHsi5V3Zg1aJsZnXvmusAb3073CPEXBPZ6qOoW95zcBXecXlnG	0	100	f	f	\N	\N	user	2025-02-19 01:44:44.170019	2025-02-19 01:44:44.170019	ativo
\.


--
-- Name: base_itens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.base_itens_id_seq', 5, true);


--
-- Name: batalhas_diarias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batalhas_diarias_id_seq', 4, true);


--
-- Name: batalhas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.batalhas_id_seq', 117, true);


--
-- Name: channels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.channels_id_seq', 2, true);


--
-- Name: dungeon_recompensas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dungeon_recompensas_id_seq', 110, true);


--
-- Name: dungeons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dungeons_id_seq', 81, true);


--
-- Name: efeitos_batalha_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.efeitos_batalha_id_seq', 39, true);


--
-- Name: equipamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipamentos_id_seq', 113, true);


--
-- Name: habilidades_efeitos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.habilidades_efeitos_id_seq', 50, true);


--
-- Name: habilidades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.habilidades_id_seq', 24, true);


--
-- Name: inventario_equipamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventario_equipamentos_id_seq', 103, true);


--
-- Name: logs_batalha_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_batalha_id_seq', 2541, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 112, true);


--
-- Name: participantes_batalha_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.participantes_batalha_id_seq', 232, true);


--
-- Name: personagens_habilidades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personagens_habilidades_id_seq', 3, true);


--
-- Name: skins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skins_id_seq', 8, true);


--
-- Name: times_batalha_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.times_batalha_id_seq', 234, true);


--
-- Name: tipos_dungeon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_dungeon_id_seq', 3, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 8, true);


--
-- Name: base_itens base_itens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.base_itens
    ADD CONSTRAINT base_itens_pkey PRIMARY KEY (id);


--
-- Name: batalhas_diarias batalhas_diarias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batalhas_diarias
    ADD CONSTRAINT batalhas_diarias_pkey PRIMARY KEY (id);


--
-- Name: batalhas_diarias batalhas_diarias_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batalhas_diarias
    ADD CONSTRAINT batalhas_diarias_usuario_id_key UNIQUE (usuario_id);


--
-- Name: batalhas batalhas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batalhas
    ADD CONSTRAINT batalhas_pkey PRIMARY KEY (id);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


--
-- Name: dungeon_recompensas dungeon_recompensas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dungeon_recompensas
    ADD CONSTRAINT dungeon_recompensas_pkey PRIMARY KEY (id);


--
-- Name: dungeons dungeons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dungeons
    ADD CONSTRAINT dungeons_pkey PRIMARY KEY (id);


--
-- Name: efeitos_batalha efeitos_batalha_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.efeitos_batalha
    ADD CONSTRAINT efeitos_batalha_pkey PRIMARY KEY (id);


--
-- Name: equipamentos equipamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipamentos
    ADD CONSTRAINT equipamentos_pkey PRIMARY KEY (id);


--
-- Name: habilidades_efeitos habilidades_efeitos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidades_efeitos
    ADD CONSTRAINT habilidades_efeitos_pkey PRIMARY KEY (id);


--
-- Name: habilidades habilidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidades
    ADD CONSTRAINT habilidades_pkey PRIMARY KEY (id);


--
-- Name: inventario_equipamentos inventario_equipamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_equipamentos
    ADD CONSTRAINT inventario_equipamentos_pkey PRIMARY KEY (id);


--
-- Name: logs_batalha logs_batalha_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_batalha
    ADD CONSTRAINT logs_batalha_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: participantes_batalha participantes_batalha_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_batalha
    ADD CONSTRAINT participantes_batalha_pkey PRIMARY KEY (id);


--
-- Name: personagem_equipamentos personagem_equipamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_equipamentos
    ADD CONSTRAINT personagem_equipamentos_pkey PRIMARY KEY (usuario_id);


--
-- Name: personagem_skins personagem_skins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_skins
    ADD CONSTRAINT personagem_skins_pkey PRIMARY KEY (usuario_id, skin_id);


--
-- Name: personagens_habilidades personagens_habilidades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagens_habilidades
    ADD CONSTRAINT personagens_habilidades_pkey PRIMARY KEY (id);


--
-- Name: personagens_habilidades personagens_habilidades_usuario_id_habilidade_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagens_habilidades
    ADD CONSTRAINT personagens_habilidades_usuario_id_habilidade_id_key UNIQUE (usuario_id, habilidade_id);


--
-- Name: skins skins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skins
    ADD CONSTRAINT skins_pkey PRIMARY KEY (id);


--
-- Name: times_batalha times_batalha_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.times_batalha
    ADD CONSTRAINT times_batalha_pkey PRIMARY KEY (id);


--
-- Name: tipos_dungeon tipos_dungeon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_dungeon
    ADD CONSTRAINT tipos_dungeon_pkey PRIMARY KEY (id);


--
-- Name: personagens usuario_atributos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagens
    ADD CONSTRAINT usuario_atributos_pkey PRIMARY KEY (usuario_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_nickname_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_nickname_key UNIQUE (nickname);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_dungeon_recompensas_coletado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dungeon_recompensas_coletado ON public.dungeon_recompensas USING btree (coletado);


--
-- Name: idx_dungeon_recompensas_dungeon; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dungeon_recompensas_dungeon ON public.dungeon_recompensas USING btree (dungeon_id);


--
-- Name: idx_dungeon_recompensas_equipamento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dungeon_recompensas_equipamento ON public.dungeon_recompensas USING btree (equipamento_id);


--
-- Name: dungeons update_dungeons_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_dungeons_updated_at BEFORE UPDATE ON public.dungeons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: habilidades update_habilidades_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_habilidades_updated_at BEFORE UPDATE ON public.habilidades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tipos_dungeon update_tipos_dungeon_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tipos_dungeon_updated_at BEFORE UPDATE ON public.tipos_dungeon FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: usuarios update_usuarios_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: batalhas_diarias batalhas_diarias_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batalhas_diarias
    ADD CONSTRAINT batalhas_diarias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: dungeons dungeons_tipo_dungeon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dungeons
    ADD CONSTRAINT dungeons_tipo_dungeon_id_fkey FOREIGN KEY (tipo_dungeon_id) REFERENCES public.tipos_dungeon(id);


--
-- Name: dungeons dungeons_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dungeons
    ADD CONSTRAINT dungeons_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: efeitos_batalha efeitos_batalha_origem_habilidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.efeitos_batalha
    ADD CONSTRAINT efeitos_batalha_origem_habilidade_id_fkey FOREIGN KEY (origem_habilidade_id) REFERENCES public.habilidades(id);


--
-- Name: efeitos_batalha efeitos_batalha_origem_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.efeitos_batalha
    ADD CONSTRAINT efeitos_batalha_origem_usuario_id_fkey FOREIGN KEY (origem_usuario_id) REFERENCES public.personagens(usuario_id);


--
-- Name: efeitos_batalha efeitos_batalha_participante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.efeitos_batalha
    ADD CONSTRAINT efeitos_batalha_participante_id_fkey FOREIGN KEY (participante_id) REFERENCES public.participantes_batalha(id);


--
-- Name: dungeon_recompensas fk_dungeon; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dungeon_recompensas
    ADD CONSTRAINT fk_dungeon FOREIGN KEY (dungeon_id) REFERENCES public.dungeons(id) ON DELETE CASCADE;


--
-- Name: inventario_equipamentos fk_equipamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_equipamentos
    ADD CONSTRAINT fk_equipamento FOREIGN KEY (equipamento_id) REFERENCES public.equipamentos(id) ON DELETE CASCADE;


--
-- Name: dungeon_recompensas fk_equipamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dungeon_recompensas
    ADD CONSTRAINT fk_equipamento FOREIGN KEY (equipamento_id) REFERENCES public.equipamentos(id) ON DELETE CASCADE;


--
-- Name: personagens fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagens
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: inventario_equipamentos fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_equipamentos
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: habilidades_efeitos habilidades_efeitos_habilidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habilidades_efeitos
    ADD CONSTRAINT habilidades_efeitos_habilidade_id_fkey FOREIGN KEY (habilidade_id) REFERENCES public.habilidades(id);


--
-- Name: logs_batalha logs_batalha_batalha_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_batalha
    ADD CONSTRAINT logs_batalha_batalha_id_fkey FOREIGN KEY (batalha_id) REFERENCES public.batalhas(id);


--
-- Name: logs_batalha logs_batalha_habilidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_batalha
    ADD CONSTRAINT logs_batalha_habilidade_id_fkey FOREIGN KEY (habilidade_id) REFERENCES public.habilidades(id);


--
-- Name: logs_batalha logs_batalha_usuario_alvo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_batalha
    ADD CONSTRAINT logs_batalha_usuario_alvo_fkey FOREIGN KEY (usuario_alvo) REFERENCES public.personagens(usuario_id);


--
-- Name: logs_batalha logs_batalha_usuario_origem_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_batalha
    ADD CONSTRAINT logs_batalha_usuario_origem_fkey FOREIGN KEY (usuario_origem) REFERENCES public.personagens(usuario_id);


--
-- Name: messages messages_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id);


--
-- Name: participantes_batalha participantes_batalha_time_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_batalha
    ADD CONSTRAINT participantes_batalha_time_id_fkey FOREIGN KEY (time_id) REFERENCES public.times_batalha(id);


--
-- Name: participantes_batalha participantes_batalha_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_batalha
    ADD CONSTRAINT participantes_batalha_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.personagens(usuario_id);


--
-- Name: personagem_equipamentos personagem_equipamentos_anel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_equipamentos
    ADD CONSTRAINT personagem_equipamentos_anel_id_fkey FOREIGN KEY (anel_id) REFERENCES public.equipamentos(id);


--
-- Name: personagem_equipamentos personagem_equipamentos_arma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_equipamentos
    ADD CONSTRAINT personagem_equipamentos_arma_id_fkey FOREIGN KEY (arma_id) REFERENCES public.equipamentos(id);


--
-- Name: personagem_equipamentos personagem_equipamentos_armadura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_equipamentos
    ADD CONSTRAINT personagem_equipamentos_armadura_id_fkey FOREIGN KEY (armadura_id) REFERENCES public.equipamentos(id);


--
-- Name: personagem_equipamentos personagem_equipamentos_botas_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_equipamentos
    ADD CONSTRAINT personagem_equipamentos_botas_id_fkey FOREIGN KEY (botas_id) REFERENCES public.equipamentos(id);


--
-- Name: personagem_equipamentos personagem_equipamentos_calcas_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_equipamentos
    ADD CONSTRAINT personagem_equipamentos_calcas_id_fkey FOREIGN KEY (calcas_id) REFERENCES public.equipamentos(id);


--
-- Name: personagem_equipamentos personagem_equipamentos_colar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_equipamentos
    ADD CONSTRAINT personagem_equipamentos_colar_id_fkey FOREIGN KEY (colar_id) REFERENCES public.equipamentos(id);


--
-- Name: personagem_equipamentos personagem_equipamentos_elmo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_equipamentos
    ADD CONSTRAINT personagem_equipamentos_elmo_id_fkey FOREIGN KEY (elmo_id) REFERENCES public.equipamentos(id);


--
-- Name: personagem_equipamentos personagem_equipamentos_luvas_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_equipamentos
    ADD CONSTRAINT personagem_equipamentos_luvas_id_fkey FOREIGN KEY (luvas_id) REFERENCES public.equipamentos(id);


--
-- Name: personagem_equipamentos personagem_equipamentos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_equipamentos
    ADD CONSTRAINT personagem_equipamentos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: personagem_skins personagem_skins_skin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_skins
    ADD CONSTRAINT personagem_skins_skin_id_fkey FOREIGN KEY (skin_id) REFERENCES public.skins(id);


--
-- Name: personagem_skins personagem_skins_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagem_skins
    ADD CONSTRAINT personagem_skins_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: personagens_habilidades personagens_habilidades_habilidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagens_habilidades
    ADD CONSTRAINT personagens_habilidades_habilidade_id_fkey FOREIGN KEY (habilidade_id) REFERENCES public.habilidades(id);


--
-- Name: personagens_habilidades personagens_habilidades_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personagens_habilidades
    ADD CONSTRAINT personagens_habilidades_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.personagens(usuario_id);


--
-- Name: times_batalha times_batalha_batalha_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.times_batalha
    ADD CONSTRAINT times_batalha_batalha_id_fkey FOREIGN KEY (batalha_id) REFERENCES public.batalhas(id);


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

