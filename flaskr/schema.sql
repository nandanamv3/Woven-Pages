DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS book_genre;
DROP TABLE IF EXISTS editions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reviews;

CREATE TABLE authors(
    authorID int AUTO_INCREMENT PRIMARY KEY,
    first_name varchar(50),
    last_name varchar(50),
    about varchar(1000)
);

CREATE TABLE books(
    bookID int AUTO_INCREMENT PRIMARY KEY,
    title varchar(100) NOT NULL,
    author INT,
    FOREIGN KEY (author) REFERENCES authors(AuthorID)
);

CREATE TABLE book_genre(
    book int NOT NULL,
    genre varchar(30) NOT NULL,
    FOREIGN KEY (book) REFERENCES books(BookID)
);

CREATE TABLE editions(
    ISBN int PRIMARY KEY,
    book int NOT NULL,
    format varchar(15) NOT NULL,
    pages int,
    publisher varchar(50),
    publish_date DATE,
    lang varchar(20),
    FOREIGN KEY (book) REFERENCES books(BookID)
);

CREATE TABLE users(
    userID int AUTO_INCREMENT PRIMARY KEY,
    username varchar(32) UNIQUE NOT NULL,
    password_hash char(60) NOT NULL
);

CREATE TABLE reviews(
    rating int DEFAULT 0,
    reviewer int NOT NULL,
    book int NOT NULL,
    user_Review varchar(1000),
    start_read Date,
    finish_read Date,
    CHECK (Rating>=0 AND Rating<=5),
    UNIQUE (reviewer,book),
    FOREIGN KEY (book) REFERENCES books(BookID),
    FOREIGN KEY (reviewer) REFERENCES users(UserID)
);