CREATE TABLE book_list (
	book_id SERIAL PRIMARY KEY,
	title TEXT UNIQUE NOT NULL,
	author TEXT
);

CREATE TABLE book_details(
	id INTEGER REFERENCES book_list(book_id) UNIQUE,
	read_date DATE,
	rate INTEGER
);


INSERT INTO book_details (id, rate)
VALUES (1, 10)

UPDATE book_details
SET read_date = '2024-09-10'
WHERE id=1;

ALTER TABLE book_details
ALTER COLUMN read_date SET NOT NULL;

-- JOIN OLID --
SELECT book_list.book_id, book_list.title, book_list.author, book_details.OLID
FROM book_list
JOIN book_details
ON book_list.book_id = book_details.id


DELETE FROM book_list
WHERE title='martin';
DELETE FROM book_details
WHERE olid='OL26571618M';


DELETE FROM book_details
WHERE id=16;
DELETE FROM book_list
WHERE title='the+lord+of+the+rings';