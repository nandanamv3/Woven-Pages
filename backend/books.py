from flask import (
    Blueprint, request, jsonify
)
from werkzeug.exceptions import abort

from backend.auth import admin_required
from backend.db import get_db

bp = Blueprint('website',__name__)

@bp.route('/api/book')
def view_book():
    db = get_db()
    books = db.execute(
        '''SELECT books.*,
        AVG(reviews.rating) AS average_rating
        FROM books JOIN reviews ON books.bookID = reviews.book
        GROUP BY books.bookID ORDER BY average_rating DESC'''
    ).fetchall()
    #convert rows to a list of dictionaries
    return jsonify([dict(row) for row in books])

@bp.route('/api/book/<int:book_id>')
def book(book_id):
    db = get_db()
    book = db.execute(
        '''SELECT books.*,
        AVG(reviews.rating) AS average_rating
        FROM books JOIN reviews ON books.bookID = reviews.book
        WHERE books.bookID = ?''',
        (book_id,)
    ).fetchone()
    genres = db.execute(
        '''SELECT genre FROM book_genre WHERE book = ?''',
        (book_id,)
    ).fetchall()
    
    if book is None:
        abort(404, f"Book id {book_id} doesn't exist.")
    
    book = dict(book)
    book['genres'] = [genre['genre'] for genre in genres]
    return jsonify(book)

@bp.route('/api/add_book',methods=['POST'])
@admin_required
def add_book():
    db = get_db()
    title = request.form['title']
    author = request.form['author']
    error = None
    genres = request.form.getlist('genres')
    if not title:
        error = 'Title is required'
    elif not author:
        error = 'Author is required'
    
    if error is not None:
        return jsonify({"error": error}),400
    
    db.execute(
        '''INSERT INTO books (title,author) VALUES (?,?)''',
        (title,author)
    )

    book_id = db.execute(
        '''SELECT bookID FROM books WHERE title = ? AND author = ?''',
        (title,author)
    ).fetchone()['bookID']

    for genre in genres:
        db.execute(
            '''INSERT INTO book_genre (book,genre) VALUES (?,?)''',
            (book_id,genre)
        )
    db.commit()
    return jsonify({"message": "Book added successfully"}),201

@bp.route('/api/book/<int:book_id>/delete',methods=['DELETE'])
@admin_required
def delete_book(book_id):
    db = get_db()
    db.execute(
        '''DELETE FROM books WHERE bookID = ?''',
        (book_id,)
    )
    db.execute(
        '''DELETE FROM book_genre WHERE book = ?''',
        (book_id,)
    )
    db.commit()
    return jsonify({"message": "Book deleted successfully"}),200

@bp.route('/api/book/<int:book_id>/update',methods=['PUT'])
@admin_required
def update_book(book_id):
    db = get_db()
    title = request.form['title']
    author = request.form['author']
    genres = request.form.getlist('genres')
    error = None
    if not title:
        error = 'Title is required'
    elif not author:
        error = 'Author is required'
    
    if error is not None:
        return jsonify({"error": error}),400
    
    db.execute(
        '''UPDATE books SET title = ?, author = ? WHERE bookID = ?''',
        (title,author,book_id)
    )
    db.execute(
        '''DELETE FROM book_genre WHERE book = ?''',
        (book_id,)
    )
    for genre in genres:
        db.execute(
            '''INSERT INTO book_genre (book,genre) VALUES (?,?)''',
            (book_id,genre)
        )
    db.commit()
    return jsonify({"message": "Book updated successfully"}),200