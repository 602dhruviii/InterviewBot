import React, { useState } from 'react';
import './form.css';

const RegisterForm = ({ onFormSubmit }) => { // Accepting a prop onFormSubmit
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
  });
  const [submitted, setSubmitted] = useState(false); // State to track form submission

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        // Form submitted successfully
        console.log('Form submitted successfully');
        setSubmitted(true); // Set submitted state to true
        // Call the onFormSubmit callback function passed from the parent component
        onFormSubmit();
      } else {
        console.error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div>
      {submitted ? ( // Conditionally render the form or a message
        <p>Form submitted successfully!</p>
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          <p className="title">Enter Credentials</p>
          <div className="flex">
            <label>
              <input
                required
                placeholder=" "
                type="text"
                className="input"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              <span>Name</span>
            </label>
          </div>

          <label>
            <input
              required
              placeholder=" "
              type="email"
              className="input"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <span>Email</span>
          </label>

          <label>
            <input
              required
              placeholder=" "
              type="password"
              className="input"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <span>PassCode</span>
          </label>
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default RegisterForm;
