"use client";

import { useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function Book() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : null);
    const [book, setBook] = useState(null);
    const [editionList, setEditionList] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [review, setReview] = useState(null);

    // Fetch data for the specific book
    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:5000/book/${id}`)
                .then(response => {
                    setBook(response.data); // Contains author, average_rating, bookID, title, genres(list), author_name, image_url
                    axios.get(`http://localhost:5000/book/${id}/editions`)
                        .then(response => {
                            setEditionList(response.data);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                    axios.get(`http://localhost:5000/book/${id}/view_reviews`)
                        .then(response => {
                            setReviews(response.data);
                        })
                        .catch(error => {
                            console.log(error);
                        });
                })
                .catch(error => {
                    console.log(error);
                });

            const token = Cookies.get('token');
            axios.get(`http://localhost:5000/book/${id}/view_user_review`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(response => {
                setReview(response.data);
            }).catch(error => {
                if (error.response && error.response.status === 404) {
                    setReview(null);
                } else {
                    console.log(error);
                }
            });
        }
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Head>
                <title>{book ? book.title : "Loading..."} - Book Details</title>
            </Head>

            <main className="container mx-auto p-8">
                {book ? (
                    <>
                        <div className="flex flex-col lg:flex-row items-start lg:items-center lg:space-x-8">
                            {/* Book Image Section */}
                            <div className="w-full lg:w-1/4 mb-6 lg:mb-0">
                                {book.image_url ? (
                                    <img
                                        src={book.image_url}
                                        alt={book.title}
                                        className="w-full h-auto object-cover rounded-lg shadow-md"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                                        No Image Available
                                    </div>
                                )}
                            </div>

                            {/* Book Details Section */}
                            <div className="w-full lg:w-3/4">
                                <h1 className="text-4xl font-bold mb-4 text-indigo-400">{book.title}</h1>
                                <a href={`/author/${book.author}`} className="text-lg font-semibold text-indigo-300 hover:text-indigo-400">
                                    <strong>Author:</strong> {book.author_name}
                                </a>
                                <p className="mt-2 text-sm">
                                    <strong>Genre:</strong> {book.genres.join(', ')}
                                </p>
                                <p className="mt-2 text-sm">
                                    <strong>Average Rating:</strong> {book.average_rating}
                                </p>
                            </div>
                        </div>

                        {/* Editions Section */}
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-indigo-400 mb-4">Editions</h2>
                            <table className="w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                <thead>
                                    <tr className="bg-gray-700">
                                        <th className="px-4 py-2">ISBN</th>
                                        <th className="px-4 py-2">Format</th>
                                        <th className="px-4 py-2">Language</th>
                                        <th className="px-4 py-2">Pages</th>
                                        <th className="px-4 py-2">Publication Date</th>
                                        <th className="px-4 py-2">Publisher</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editionList.length > 0 ? (
                                        editionList.map((edition, index) => (
                                            <tr key={index} className="border-t border-gray-700">
                                                <td className="px-4 py-2">{edition.ISBN || '-'}</td>
                                                <td className="px-4 py-2">{edition.format || '-'}</td>
                                                <td className="px-4 py-2">{edition.language || '-'}</td>
                                                <td className="px-4 py-2">{edition.pages || '-'}</td>
                                                <td className="px-4 py-2">{edition.publication_date || '-'}</td>
                                                <td className="px-4 py-2">{edition.publisher || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="px-4 py-2 text-center" colSpan="6">No editions available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* User Review Section */}
                        <div className="mt-8">
                            {review ? (
                                <>
                                    <h2 className="text-2xl font-bold text-indigo-400 mb-4">Your Review</h2>
                                    <p><strong>Rating:</strong> {review.rating}</p>
                                    <p>{review.user_Review}</p>
                                    <a href={`/book/${id}/review`} className="text-indigo-400 hover:text-indigo-500">Edit Review</a>
                                </>
                            ) : (
                                <a href={`/book/${id}/review`} className="text-indigo-400 hover:text-indigo-500">Write a Review</a>
                            )}
                        </div>

                        {/* All Reviews Section */}
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-indigo-400 mb-4">Reviews</h2>
                            <ul className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map((review, index) => (
                                        <li key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
                                            <a href={`/user/${review.reviewer}`} className="text-indigo-300 hover:text-indigo-400">{review.username}</a>
                                            <p><strong>Rating:</strong> {review.rating}</p>
                                            <p>{review.user_Review}</p>
                                        </li>
                                    ))
                                ) : (
                                    <p>No reviews yet</p>
                                )}
                            </ul>
                        </div>
                    </>
                ) : (
                    <p className="text-center">Loading...</p>
                )}
            </main>
        </div>
    );
}
