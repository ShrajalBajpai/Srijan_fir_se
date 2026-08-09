console.log("Website loaded successfully!");
function showQuote(number) {

    const quotes = document.querySelectorAll(".quote");
    const dots = document.querySelectorAll(".dot");

    // Hide all quotes
    quotes.forEach(function(quote) {
        quote.classList.remove("active");
    });

    // Remove active state from dots
    dots.forEach(function(dot) {
        dot.classList.remove("active");
    });

    // Show selected quote
    quotes[number].classList.add("active");

    // Activate selected dot
    dots[number].classList.add("active");
}