create table tb_usuario (
	usu_id int primary key auto_increment,
    usu_nome varchar(200),
    usu_email varchar(200),
    usu_senha varchar(32),
    usu_ativo enum('S', 'N')
);

create table tb_consorcio (
	con_id int primary key auto_increment,
    con_nome varchar(200),
    usu_id int,
    con_quantidadecotas int,
    con_valorpremio decimal(10,2),
    con_taxaadministracao decimal(2,2),
    con_fundoreserva decimal(2,2),
    con_valormensal decimal(10,2),
    con_diaassembleia int,
    con_datainicio date,
    con_datafim date,
    con_status enum ('FINALIZADO', 'EM PROCESSO'),
    
    constraint fk_consorcio_usuario foreign key (usu_id) references tb_usuario (usu_id)
);

create table tb_cota (
	cot_id int primary key auto_increment,
    con_id int,
    usu_id int,
    cot_numero int,
    cot_status enum ('REGULAR', 'CONTEMPLADA', 'INADIMPLEMTE'),

	constraint fk_cota_usuario foreign key (usu_id) references tb_usuario (usu_id),
    constraint fk_cota_consorcio foreign key (con_id) references tb_consorcio (con_id)
);

create table tb_assembleia (
	ass_id int primary key auto_increment,
    ass_numero int,
    con_id int,
    ass_data date,
    cot_id int,
    
    constraint fk_assembleia_consorcio foreign key (con_id) references tb_consorcio (con_id)
);


create table tb_pagamento (
	pag_id int primary key auto_increment,
    cot_id int,
    ass_id int,
    pag_status enum ("PENDENTE", "CONFIRMADO"),
    pag_datageracao datetime,
    pag_datapagamento datetime,
    pag_valor decimal(10,2),
    
    constraint fk_pagamento_cota foreign key (cot_id) references tb_cota (cot_id),
    constraint fk_pagamento_assembleia foreign key (ass_id) references tb_assembleia (ass_id)
);

create table tb_saldoconsorcio (
	sal_id int primary key auto_increment,
    con_id int,
    sal_valor decimal (12,2),
    sal_dataatualizacao datetime,
    
    CONSTRAINT fk_saldo_con_consorcio FOREIGN KEY (con_id) REFERENCES tb_consorcio (con_id)
);

create table tb_movimentacaoconsorcio (
	mov_id int primary key auto_increment,
    con_id int,
    pag_id int,
    ass_id int,
    mov_tipo enum("ENTRADA", "SAIDA"),
    mov_valor decimal (12,2),
    mov_data datetime,
    
	CONSTRAINT fk_movconsorcio_consorcio  FOREIGN KEY (con_id) REFERENCES tb_consorcio (con_id),
    CONSTRAINT fk_movconsorcio_pagamento  FOREIGN KEY (pag_id) REFERENCES tb_pagamento (pag_id),
    CONSTRAINT fk_movconsorcio_assembleia FOREIGN KEY (ass_id) REFERENCES tb_assembleia (ass_id)
);

create table tb_saldoadministrador (
	sad_id int primary key auto_increment,
    usu_id int,
    sad_valor decimal(12,2),
    sad_dataatualizacao datetime,
    
	CONSTRAINT fk_saldoadm_usuario FOREIGN KEY (usu_id) REFERENCES tb_usuario (usu_id)
);

create table tb_movimentacaoadministrador (
	mva_id int primary key auto_increment,
    usu_id int,
    con_id int,
    pag_id int,
    mva_tipo enum("CREDITO", "SAQUE"),
    mva_valor decimal(12,2),
    mva_data datetime,
    
	CONSTRAINT fk_movadm_usuario    FOREIGN KEY (usu_id) REFERENCES tb_usuario (usu_id),
    CONSTRAINT fk_movadm_consorcio  FOREIGN KEY (con_id) REFERENCES tb_consorcio (con_id),
    CONSTRAINT fk_movadm_pagamento  FOREIGN KEY (pag_id) REFERENCES tb_pagamento (pag_id)
);

