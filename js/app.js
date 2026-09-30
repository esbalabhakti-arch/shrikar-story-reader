// =============================================
// SHRIKAR STORY READER
// PreparedBook v2.0
// =============================================

let currentBook = null;


// ---------------------------------------------
// PAGE ELEMENTS
// ---------------------------------------------

const bookFile = document.getElementById("bookFile");
const loadBookButton = document.getElementById("loadBookButton");
const statusMessage = document.getElementById("statusMessage");


// ---------------------------------------------
// LOAD BOOK
// ---------------------------------------------

loadBookButton.addEventListener("click", loadBook);


function loadBook() {

    const file = bookFile.files[0];

    if (!file) {
        statusMessage.textContent =
            "Please choose a PreparedBook JSON file first.";
        return;
    }


    const reader = new FileReader();


    reader.onload = function(event) {

        try {

            const book = JSON.parse(event.target.result);


            // ---------------------------------
            // VALIDATE BOOK FORMAT
            // ---------------------------------

            if (book.format !== "ShrikarPreparedBook") {

                throw new Error(
                    "This is not a Shrikar PreparedBook file."
                );

            }


            if (book.version !== "2.0") {

                throw new Error(
                    "This reader requires PreparedBook version 2.0."
                );

            }


            if (!Array.isArray(book.sentences)) {

                throw new Error(
                    "The book does not contain a sentences list."
                );

            }


            if (!Array.isArray(book.readingSections)) {

                throw new Error(
                    "The book does not contain readingSections."
                );

            }


            if (!Array.isArray(book.reviews)) {

                throw new Error(
                    "The book does not contain reviews."
                );

            }


            // ---------------------------------
            // SAVE BOOK
            // ---------------------------------

            currentBook = book;


            // ---------------------------------
            // CONFIRM SUCCESS
            // ---------------------------------

            statusMessage.innerHTML = `
                ✅ <strong>${book.title}</strong> is ready.<br><br>

                ${book.sentences.length} story lines<br>
                ${book.readingSections.length} reading sections<br>
                ${book.reviews.length} story reviews
            `;


            console.log(
                "PreparedBook v2.0 loaded:",
                currentBook
            );

        }

        catch (error) {

            currentBook = null;

            statusMessage.textContent =
                "❌ Could not load book: " +
                error.message;

            console.error(error);

        }

    };


    reader.readAsText(file);

}
