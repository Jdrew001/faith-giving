--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3 (Debian 15.3-1.pgdg120+1)
-- Dumped by pg_dump version 15.3 (Debian 15.3-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: client_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_session (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    "individualId" uuid NOT NULL
);


ALTER TABLE public.client_session OWNER TO postgres;

--
-- Name: giving; Type: TABLE; Schema: public; Owner: dtatkison
--

CREATE TABLE public.giving (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tithe numeric(10,2) NOT NULL,
    "feeCovered" boolean NOT NULL,
    "individualId" uuid,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL
);


ALTER TABLE public.giving OWNER TO dtatkison;

--
-- Name: individual; Type: TABLE; Schema: public; Owner: dtatkison
--

CREATE TABLE public.individual (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    firstname character varying NOT NULL,
    lastname character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL
);


ALTER TABLE public.individual OWNER TO dtatkison;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: dtatkison
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO dtatkison;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: dtatkison
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO dtatkison;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dtatkison
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: offering; Type: TABLE; Schema: public; Owner: dtatkison
--

CREATE TABLE public.offering (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    amount numeric(10,2) NOT NULL,
    type integer NOT NULL,
    other character varying,
    "givingId" uuid,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL
);


ALTER TABLE public.offering OWNER TO dtatkison;

--
-- Name: offering_type; Type: TABLE; Schema: public; Owner: dtatkison
--

CREATE TABLE public.offering_type (
    id integer NOT NULL,
    label character varying NOT NULL,
    disabled boolean NOT NULL,
    "activeInd" character varying NOT NULL
);


ALTER TABLE public.offering_type OWNER TO dtatkison;

--
-- Name: payment_method; Type: TABLE; Schema: public; Owner: dtatkison
--

CREATE TABLE public.payment_method (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "individualId" uuid,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL
);


ALTER TABLE public.payment_method OWNER TO dtatkison;

--
-- Name: role; Type: TABLE; Schema: public; Owner: dtatkison
--

CREATE TABLE public.role (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.role OWNER TO dtatkison;

--
-- Name: user; Type: TABLE; Schema: public; Owner: dtatkison
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    firstname character varying NOT NULL,
    lastname character varying NOT NULL,
    phonenumber character varying NOT NULL
);


ALTER TABLE public."user" OWNER TO dtatkison;

--
-- Name: user_roles_role; Type: TABLE; Schema: public; Owner: dtatkison
--

CREATE TABLE public.user_roles_role (
    "userId" uuid NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public.user_roles_role OWNER TO dtatkison;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: client_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_session (id, created_at, updated_at, "individualId") VALUES ('08b8bccc-adbb-48f3-82eb-3ebf943ce157', '2023-07-07 14:59:35.705306', '2023-07-07 14:59:35.705306', '2acdb337-217e-482b-a359-bb2e8a7f38c1');


--
-- Data for Name: giving; Type: TABLE DATA; Schema: public; Owner: dtatkison
--

INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('b915f61a-5d62-470d-8010-6a0b656066c7', 370.00, false, '2acdb337-217e-482b-a359-bb2e8a7f38c1', '2023-05-26 00:08:15', '2023-05-26 00:08:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('68a27e67-b7fc-461c-a4ce-ff9c53681033', 2.50, false, '2acdb337-217e-482b-a359-bb2e8a7f38c1', '2023-06-05 00:08:15', '2023-06-05 00:08:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('829882f9-9413-4cbb-ab42-b8d22843bf17', 160.00, false, '3b18da91-d7e5-4916-a77c-06d39945b270', '2023-05-26 00:08:15', '2023-05-26 00:08:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('a39f6cae-6734-4d44-8cf5-5bc93c49190f', 2.50, false, '2acdb337-217e-482b-a359-bb2e8a7f38c1', '2023-06-05 00:05:15', '2023-06-05 00:05:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('dbf16bf0-34ab-48fc-a816-3c40e433d44a', 2.50, true, '2acdb337-217e-482b-a359-bb2e8a7f38c1', '2023-06-05 00:08:15', '2023-06-05 00:08:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('a05bd6d9-5165-4cc9-af21-9a4bd16b1977', 1.00, false, '2acdb337-217e-482b-a359-bb2e8a7f38c1', '2023-06-05 00:09:15', '2023-06-05 00:09:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('6ea5b674-c3e4-47f9-9492-7498ebdfffd8', 2.50, false, '2acdb337-217e-482b-a359-bb2e8a7f38c1', '2023-06-05 00:07:15', '2023-06-05 00:07:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('e94c0b34-0721-4fb9-8a54-56698e05a335', 2.50, false, '2acdb337-217e-482b-a359-bb2e8a7f38c1', '2023-06-05 00:06:15', '2023-06-05 00:06:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('eda50b34-57f5-4110-a4ea-b2971a2b5580', 20.00, true, 'd20d50c6-78f9-4d90-9bc4-d7ed50cd59cf', '2023-05-28 00:08:15', '2023-05-28 00:08:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('07d54e57-da9b-4600-a36f-02dcdd9888fa', 500.00, true, 'fa8c6cff-64a9-447c-8142-a70d60996eca', '2023-06-04 00:08:15', '2023-06-04 00:08:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('42f2c9ef-5b03-47f6-a801-410c37dbf934', 120.00, false, '3b18da91-d7e5-4916-a77c-06d39945b270', '2023-06-01 00:05:15', '2023-06-01 00:05:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('4fc7f4dd-63d8-404a-842f-df5c92dc47ca', 2.50, true, '2acdb337-217e-482b-a359-bb2e8a7f38c1', '2023-05-25 00:08:15', '2023-05-25 00:08:15');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('36e2205c-4655-490b-b79b-b8861a52b3a2', 140.00, false, '3b18da91-d7e5-4916-a77c-06d39945b270', '2023-07-06 00:11:55.968587', '2023-07-06 00:11:55.968587');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('8b1877de-51e0-49fb-baac-c650c70681c7', 368.81, true, '2acdb337-217e-482b-a359-bb2e8a7f38c1', '2023-07-07 14:59:35.613718', '2023-07-07 14:59:35.613718');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('0c7fc781-22a5-44fb-bd5e-f8535888c906', 0.00, true, 'fa8c6cff-64a9-447c-8142-a70d60996eca', '2023-07-02 19:14:17.163626', '2023-07-02 19:14:17.163626');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('0a0df9f5-b5ed-4ed9-87f8-12ed08f1856f', 500.00, true, 'fa8c6cff-64a9-447c-8142-a70d60996eca', '2023-07-02 19:13:00.722948', '2023-07-02 19:13:00.722948');
INSERT INTO public.giving (id, tithe, "feeCovered", "individualId", created_at, updated_at) VALUES ('217a707b-d578-4c86-92d2-82b69ee3f3fb', 2.50, false, '2acdb337-217e-482b-a359-bb2e8a7f38c1', '2023-07-07 21:39:57.172155', '2023-07-07 21:39:57.172155');


--
-- Data for Name: individual; Type: TABLE DATA; Schema: public; Owner: dtatkison
--

INSERT INTO public.individual (id, firstname, lastname, email, phone, created_at, updated_at) VALUES ('2acdb337-217e-482b-a359-bb2e8a7f38c1', 'Drew', 'Atkison', 'dtatkison@gmail.com', '6824140386', '2023-07-02 00:21:21.936127', '2023-07-02 00:21:21.936127');
INSERT INTO public.individual (id, firstname, lastname, email, phone, created_at, updated_at) VALUES ('fa8c6cff-64a9-447c-8142-a70d60996eca', 'Ginger', 'Nelson', 'bookikiluke@sbcglobal.net', '8176752000', '2023-07-02 00:21:21.936127', '2023-07-02 00:21:21.936127');
INSERT INTO public.individual (id, firstname, lastname, email, phone, created_at, updated_at) VALUES ('3b18da91-d7e5-4916-a77c-06d39945b270', 'Hector', 'Yanez', 'hectorman15000@gmail.com', '8173233673', '2023-07-02 00:21:21.936127', '2023-07-02 00:21:21.936127');
INSERT INTO public.individual (id, firstname, lastname, email, phone, created_at, updated_at) VALUES ('d20d50c6-78f9-4d90-9bc4-d7ed50cd59cf', 'Elizabeth', 'Atkison', 'izzybeth.harris@gmail.com', '8177186462', '2023-07-02 00:21:21.936127', '2023-07-02 00:21:21.936127');


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: dtatkison
--

INSERT INTO public.migrations (id, "timestamp", name) VALUES (1, 1687833616359, 'InitData1687833616359');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (2, 1688245863068, 'AddRole1688245863068');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (3, 1688254236308, 'UpdatedAtCreatedAt1688254236308');
INSERT INTO public.migrations (id, "timestamp", name) VALUES (4, 1688341082973, 'CreateSessionTable1688341082973');


--
-- Data for Name: offering; Type: TABLE DATA; Schema: public; Owner: dtatkison
--

INSERT INTO public.offering (id, amount, type, other, "givingId", created_at, updated_at) VALUES ('f4e018dc-308b-457e-8d55-aedf1ebe54c7', 1.25, 3, '', '4fc7f4dd-63d8-404a-842f-df5c92dc47ca', '2023-07-02 00:21:21.936127', '2023-07-02 00:21:21.936127');
INSERT INTO public.offering (id, amount, type, other, "givingId", created_at, updated_at) VALUES ('56e40d08-9cc8-4bcf-a728-571af73af4f6', 25.00, 2, '', '42f2c9ef-5b03-47f6-a801-410c37dbf934', '2023-06-01 00:05:15', '2023-06-01 00:05:15');
INSERT INTO public.offering (id, amount, type, other, "givingId", created_at, updated_at) VALUES ('e8d207f1-8c0f-4469-aaa4-741189472581', 100.00, 2, '', 'b915f61a-5d62-470d-8010-6a0b656066c7', '2023-05-26 00:08:15', '2023-05-26 00:08:15');
INSERT INTO public.offering (id, amount, type, other, "givingId", created_at, updated_at) VALUES ('6ee127aa-67f4-4ece-90bb-11e7cf10e658', 25.00, 6, '', '829882f9-9413-4cbb-ab42-b8d22843bf17', '2023-05-25 00:08:15', '2023-05-25 00:08:15');
INSERT INTO public.offering (id, amount, type, other, "givingId", created_at, updated_at) VALUES ('bbcdddae-0640-48f3-875b-84eeb89d4106', 20.00, 6, '', '0c7fc781-22a5-44fb-bd5e-f8535888c906', '2023-07-02 19:14:17.163626', '2023-07-02 19:14:17.163626');
INSERT INTO public.offering (id, amount, type, other, "givingId", created_at, updated_at) VALUES ('9f16486a-173a-44e6-ba9e-41b87c636f7f', 25.00, 2, '', '36e2205c-4655-490b-b79b-b8861a52b3a2', '2023-07-06 00:11:55.968587', '2023-07-06 00:11:55.968587');
INSERT INTO public.offering (id, amount, type, other, "givingId", created_at, updated_at) VALUES ('7df124bd-f324-4a6a-92c8-191ee353b572', 100.00, 6, '', '8b1877de-51e0-49fb-baac-c650c70681c7', '2023-07-07 14:59:35.613718', '2023-07-07 14:59:35.613718');


--
-- Data for Name: offering_type; Type: TABLE DATA; Schema: public; Owner: dtatkison
--

INSERT INTO public.offering_type (id, label, disabled, "activeInd") VALUES (1, 'General Offering', false, 'A');
INSERT INTO public.offering_type (id, label, disabled, "activeInd") VALUES (2, 'Move the Mission', false, 'A');
INSERT INTO public.offering_type (id, label, disabled, "activeInd") VALUES (3, 'Foreign Missions', false, 'A');
INSERT INTO public.offering_type (id, label, disabled, "activeInd") VALUES (4, 'Building Fund', false, 'A');
INSERT INTO public.offering_type (id, label, disabled, "activeInd") VALUES (5, 'Home Missions', false, 'A');
INSERT INTO public.offering_type (id, label, disabled, "activeInd") VALUES (6, 'Youth Ministry', false, 'A');
INSERT INTO public.offering_type (id, label, disabled, "activeInd") VALUES (7, 'Other', false, 'A');


--
-- Data for Name: payment_method; Type: TABLE DATA; Schema: public; Owner: dtatkison
--



--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: dtatkison
--

INSERT INTO public.role (id, name) VALUES (0, 'ADMIN');
INSERT INTO public.role (id, name) VALUES (1, 'VIEWER');
INSERT INTO public.role (id, name) VALUES (3, 'TESTER');


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: dtatkison
--

INSERT INTO public."user" (id, email, firstname, lastname, phonenumber) VALUES ('be7b7910-0e52-11ee-be56-0242ac120002', 'dtatkison@gmail.com', 'Drew', 'Atkison', '6824140386');
INSERT INTO public."user" (id, email, firstname, lastname, phonenumber) VALUES ('39ba9030-9859-4621-803c-c3ebac4feb29', 'elatkison@gmail.com', 'Elizabeth', 'Atkison', '8177186462');
INSERT INTO public."user" (id, email, firstname, lastname, phonenumber) VALUES ('eb84b35d-03a9-410b-96a0-12351bfe9b3e', 'faithtabernacleupcarlington@gmail.com', 'Jonathan', 'Harris', '8178917012');


--
-- Data for Name: user_roles_role; Type: TABLE DATA; Schema: public; Owner: dtatkison
--

INSERT INTO public.user_roles_role ("userId", "roleId") VALUES ('be7b7910-0e52-11ee-be56-0242ac120002', 0);
INSERT INTO public.user_roles_role ("userId", "roleId") VALUES ('39ba9030-9859-4621-803c-c3ebac4feb29', 1);
INSERT INTO public.user_roles_role ("userId", "roleId") VALUES ('eb84b35d-03a9-410b-96a0-12351bfe9b3e', 0);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: dtatkison
--

SELECT pg_catalog.setval('public.migrations_id_seq', 4, true);


--
-- Name: giving PK_28585d326dfd0126317c7d0e715; Type: CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.giving
    ADD CONSTRAINT "PK_28585d326dfd0126317c7d0e715" PRIMARY KEY (id);


--
-- Name: individual PK_65e322b841a6d5e28a488d584de; Type: CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.individual
    ADD CONSTRAINT "PK_65e322b841a6d5e28a488d584de" PRIMARY KEY (id);


--
-- Name: offering_type PK_7017625e6bca711c0a1c23286c1; Type: CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.offering_type
    ADD CONSTRAINT "PK_7017625e6bca711c0a1c23286c1" PRIMARY KEY (id);


--
-- Name: payment_method PK_7744c2b2dd932c9cf42f2b9bc3a; Type: CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.payment_method
    ADD CONSTRAINT "PK_7744c2b2dd932c9cf42f2b9bc3a" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: client_session PK_970f7a10ae0565536c473e223c7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_session
    ADD CONSTRAINT "PK_970f7a10ae0565536c473e223c7" PRIMARY KEY (id);


--
-- Name: role PK_b36bcfe02fc8de3c57a8b2391c2; Type: CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id);


--
-- Name: user_roles_role PK_b47cd6c84ee205ac5a713718292; Type: CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.user_roles_role
    ADD CONSTRAINT "PK_b47cd6c84ee205ac5a713718292" PRIMARY KEY ("userId", "roleId");


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: offering PK_d42d2720ff82f75aae518b9347c; Type: CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.offering
    ADD CONSTRAINT "PK_d42d2720ff82f75aae518b9347c" PRIMARY KEY (id);


--
-- Name: IDX_4be2f7adf862634f5f803d246b; Type: INDEX; Schema: public; Owner: dtatkison
--

CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON public.user_roles_role USING btree ("roleId");


--
-- Name: IDX_5f9286e6c25594c6b88c108db7; Type: INDEX; Schema: public; Owner: dtatkison
--

CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON public.user_roles_role USING btree ("userId");


--
-- Name: user_roles_role FK_4be2f7adf862634f5f803d246b8; Type: FK CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.user_roles_role
    ADD CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles_role FK_5f9286e6c25594c6b88c108db77; Type: FK CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.user_roles_role
    ADD CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_method FK_a486613d0b9db20ff7e6b6a3e3e; Type: FK CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.payment_method
    ADD CONSTRAINT "FK_a486613d0b9db20ff7e6b6a3e3e" FOREIGN KEY ("individualId") REFERENCES public.individual(id);


--
-- Name: client_session FK_b6a6cbb9cfbc642dd0a14efa35f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_session
    ADD CONSTRAINT "FK_b6a6cbb9cfbc642dd0a14efa35f" FOREIGN KEY ("individualId") REFERENCES public.individual(id) ON DELETE CASCADE;


--
-- Name: offering FK_c146ddf00d3b99a55a05618f619; Type: FK CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.offering
    ADD CONSTRAINT "FK_c146ddf00d3b99a55a05618f619" FOREIGN KEY ("givingId") REFERENCES public.giving(id);


--
-- Name: giving FK_e1a3a98ef97806a71fbd0504b60; Type: FK CONSTRAINT; Schema: public; Owner: dtatkison
--

ALTER TABLE ONLY public.giving
    ADD CONSTRAINT "FK_e1a3a98ef97806a71fbd0504b60" FOREIGN KEY ("individualId") REFERENCES public.individual(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO dtatkison;


--
-- Name: TABLE client_session; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.client_session TO dtatkison;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO dtatkison;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO dtatkison;


--
-- PostgreSQL database dump complete
--

