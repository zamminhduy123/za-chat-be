DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS "conversation" CASCADE;
DROP TABLE IF EXISTS "member" CASCADE;
DROP TABLE IF EXISTS "message" CASCADE;
DROP TABLE IF EXISTS "last_message" CASCADE;

DROP TABLE IF EXISTS "publicKey" CASCADE;

-- ======================================
-- Create table
-- ======================================
-- -----------------------------
-- Table account
-- ----------------------------- 

CREATE TABLE "user" (
	"username" varchar(50) PRIMARY KEY, -- PRIMARYKEY <=> UNIQUE, NOT NULL
	"password" varchar(255),
	"name" varchar(50),
	"gender" numeric DEFAULT 0,
	"phone" varchar(10),
	"avatar" varchar(1000),
	"hashKey" varchar(256),
	"create_at" timestamp NOT NULL DEFAULT NOW()
);

INSERT INTO "user"("username", "password", "name","phone","avatar","hashKey")
VALUES 
	('user', '$2b$10$8RXK4w.tYJ4XTO0ZwnkiJuAieFMfrXtTV4UBxpVpJrGMYKnUt6sBy', 'Duy','0399477967', 'https://assets.teenvogue.com/photos/60802540112a89b8d0d504e0/4:3/w_3711,h_2783,c_limit/GettyImages-1199371669.jpg','jhasgbfaysdfvbhsdvg'),
	( 'user1', '$2b$10$8RXK4w.tYJ4XTO0ZwnkiJuAieFMfrXtTV4UBxpVpJrGMYKnUt6sBy', 'Kendall Jenner', '0909320249','https://kenh14cdn.com/thumb_w/660/203336854389633024/2021/9/15/gettyimages-1340153581-1631680268419553194521.jpeg','jhasgbfayasdasdasdfvbhsdvg'),
	( 'user2', '$2b$10$8RXK4w.tYJ4XTO0ZwnkiJuAieFMfrXtTV4UBxpVpJrGMYKnUt6sBy', 'I lon mút','0123456789', 'https://ichef.bbci.co.uk/news/976/cpsprodpb/7727/production/_103330503_musk3.jpg','jhasgbfa12312ysasd123dfvbhsdvg'),
	( 'user3', '$2b$10$8RXK4w.tYJ4XTO0ZwnkiJuAieFMfrXtTV4UBxpVpJrGMYKnUt6sBy', 'Mắc zức cờ bớt','1234567890', 'https://vtv1.mediacdn.vn/thumb_w/650/2021/4/25/photo-1-1619306202198493971443.jpg','jhasgbfaysdf123123ssvbhsdvg'),
	( 'user4', '$2b$10$8RXK4w.tYJ4XTO0ZwnkiJuAieFMfrXtTV4UBxpVpJrGMYKnUt6sBy', 'Hải Mentor','0917560996', 'https://toiyeubitcoin.sgp1.digitaloceanspaces.com/wp-content/uploads/2021/05/10191256/gia-cho-shiba-inu-02-768x768_0.jpeg','xczxcgbfaysdfvbhsdvg');

create table "publicKey" (
	"deviceKey" varchar(64) PRIMARY KEY,
	"username" varchar(50), -- PRIMARYKEY <=> UNIQUE, NOT NULL
	"publicKey" varchar(64),
"create_at" timestamp NOT NULL DEFAULT NOW(),

	FOREIGN KEY (username) REFERENCES "user"(username)
);

CREATE TABLE "conversation" (
	"id" serial PRIMARY KEY,
	"name" varchar(50),
	"totalMessage" numeric default 0,
	"create_at" timestamp NOT NULL DEFAULT NOW(),
	"delete_at" timestamp
);

-- INSERT INTO "conversation"("name")
-- values 
-- ('Kendall Jenner'),('I lon mút'),('Mắc zức cờ bớt'),('Hải Mentor');


CREATE TABLE "member" (
	"id" serial PRIMARY KEY,
	"conversation_id" serial,
	"username" varchar(50),
	"create_at" timestamp NOT NULL DEFAULT NOW(),
	
	FOREIGN KEY (conversation_id) REFERENCES conversation(id),
	FOREIGN KEY (username) REFERENCES "user"(username)
);


-- INSERT INTO "member"("conversation_id","username")
-- values 
-- (1, 'user1'),( 1, 'user'),
-- (2, 'user2'),( 2, 'user'),
-- (3, 'user3'),( 3, 'user');

CREATE TABLE "message" (
	"id" serial PRIMARY KEY,
	"conversation_id" serial,
	"sender" varchar(50),
	"type" numeric DEFAULT 0, -- text
	"to" varchar(50),
	"status" numeric DEFAULT 1, -- sent
	"content" varchar(1000),
	"create_at" timestamp NOT NULL DEFAULT NOW(),
	"delete_at" timestamp,
	
	FOREIGN KEY (conversation_id) REFERENCES conversation(id),
	FOREIGN KEY (sender) REFERENCES "user"(username)
);

create table "last_message" (
	"message_id" serial,
	"conversation_id" serial PRIMARY KEY,
	
	FOREIGN KEY (message_id) REFERENCES "message"(id),
	FOREIGN KEY (conversation_id) REFERENCES "conversation"(id)
)


