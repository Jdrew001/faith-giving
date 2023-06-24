
-- Ref Data additions --
insert into offering_type (id, label, disabled, "activeInd")
    values (1, 'General Offering', false, 'A');

insert into offering_type (id, label, disabled, "activeInd")
    values (2, 'Move the Mission', false, 'A');

insert into offering_type (id, label, disabled, "activeInd")
    values (3, 'Foreign Missions', false, 'A');

insert into offering_type (id, label, disabled, "activeInd")
    values (4, 'Building Fund', false, 'A');

insert into offering_type (id, label, disabled, "activeInd")
    values (5, 'Home Missions', false, 'A');

insert into offering_type (id, label, disabled, "activeInd")
    values (6, 'Youth Ministry', false, 'A');

insert into offering_type (id, label, disabled, "activeInd")
    values (7, 'Other', false, 'A');

-- Role Data Additions
insert into role (id)
    values (0);

insert into role (id)
    values (1);

insert into "user" (email, firstname, lastname, phonenumber)
    values ('dtatkison@gmail.com', 'Drew', 'Atkison', '6824140386');

insert into "user" (email, firstname, lastname, phonenumber)
    values ('elatkison@gmail.com', 'Elizabeth', 'Atkison', '8177186462');

-- insert into user_roles_role ("userId", "roleId")
--     values ('be7b7910-0e52-11ee-be56-0242ac120002', 0);
--
-- insert into user_roles_role ("userId", "roleId")
--     values ('39ba9030-9859-4621-803c-c3ebac4feb29', 1);



--
-- select * from role;
-- select * from offering_type;
-- select * from "user";