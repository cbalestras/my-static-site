document.addEventListener('DOMContentLoaded', function() {
  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simple form validation
      const name = contactForm.querySelector('input[name="name"]').value;
      const email = contactForm.querySelector('input[name="email"]').value;
      const message = contactForm.querySelector('textarea[name="message"]').value;
      
      if (!name || !email || !message) {
        alert('Please fill out all fields');
        return;
      }
      
      // Here you would normally send the form data to a server
      // For this simple example, we'll just show a success message
      alert('Thank you for your message! We will get back to you soon.');
      contactForm.reset();
    });
  }
  
  // Newsletter form handling
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = newsletterForm.querySelector('input[name="email"]').value;
      
      if (!email) {
        alert('Please enter your email');
        return;
      }
      
      // Here you would integrate with ConvertKit or another service
      // For this example, we'll just show a success message
      alert('Thank you for subscribing to our newsletter!');
      newsletterForm.reset();
    });
  }
}); 