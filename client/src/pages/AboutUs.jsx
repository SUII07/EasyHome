import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AboutUs.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const howItWorks = [
  {
    title: "Find Service Providers",
    description: "Explore our extensive network of verified and skilled service providers. Use the dropdown search to easily find the right professional based on the service you need.",
    image: "./Service.png",
  },
  {
    title: "Book Services",
    description: "Booking a service is quick and easy. Browse through the list of available service providers, select the one that suits your needs, and send a booking request directly through the platform. The service provider will get back to you to confirm the details.",
    image: "./Book.png",
  },
  {
    title: "Get Quality Service",
    description: "Enjoy reliable and professional service right at your doorstep. Our trusted and verified service providers come to your home and make sure the work is done properly. We focus on giving you quality service and making sure you're fully satisfied with the results.",
    image: "./Get.png",
  }
];

const AboutUs = () => {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:4000/api/messages', { message_text: message }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setStatus({ type: 'success', message: 'Message sent successfully!' });
            setMessage('');
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
        }
    };

    return (
        <>
        <Header />
        <div className="about-us-container">
            <div className="about-section">
                <h1>About EasyHome</h1>
                <p>
                    Welcome to EasyHome, your trusted partner in home services. We connect homeowners
                    with reliable service providers for all their home maintenance and improvement needs.
                </p>
                <p>
                    Our mission is to make home services accessible, reliable, and convenient for everyone.
                    Whether you need plumbing, electrical work, cleaning, or any other home service,
                    we've got you covered.
                </p>
            </div>

            <section className="how-it-works">
              <h2>How it Works</h2>
              <p className="section-subtitle">Get your home services done in three simple steps</p>
              <div className="how-grid">
                {howItWorks.map((step, index) => (
                  <div key={index} className="how-step">
                    <div className="step-number">{index + 1}</div>
                    <img src={step.image} alt={step.title} />
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="contact-section">
                <h2>Contact Us</h2>
                <p>Have questions or feedback? We'd love to hear from you!</p>
                {user ? (
                    <form onSubmit={handleSubmit} className="contact-form">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            required
                        />
                        <button type="submit">Send Message</button>
                    </form>
                ) : (
                    <div className="status-message error">You must be logged in to send a message.</div>
                )}
                {status.message && (
                    <div className={`status-message ${status.type}`}>
                        {status.message}
                    </div>
                )}
            </div>
        </div>
        <Footer />
        </>
    );
};

export default AboutUs; 