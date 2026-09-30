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
const readingScreen = document.getElementById("readingScreen");
const bookTitle = document.getElementById("bookTitle");

const storySoFarBox = document.getElementById("storySoFarBox");
const storySoFarText = document.getElementById("storySoFarText");

const storyLines = document.getElementById("storyLines");

const nextButton = document.getElementById("nextButton");

let currentSectionIndex = 0;

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
            currentSectionIndex = 0;
            nextButton.style.display = "inline-block";
            showReadingSection();

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
// =============================================
// SHOW READING SECTION
// =============================================

function showReadingSection() {

    if (!currentBook) {
        return;
    }


    const section =
        currentBook.readingSections[currentSectionIndex];


    if (!section) {
        showFinishedScreen();
        return;
    }


    // -----------------------------------------
    // SHOW READING SCREEN
    // -----------------------------------------

    readingScreen.style.display = "block";

    bookTitle.textContent = currentBook.title;


    // -----------------------------------------
    // STORY SO FAR
    // -----------------------------------------

    if (
        section.storySoFar &&
        section.storySoFar.trim() !== ""
    ) {

        storySoFarBox.style.display = "block";

        storySoFarText.textContent =
            section.storySoFar;

    }

    else {

        storySoFarBox.style.display = "none";

        storySoFarText.textContent = "";

    }


    // -----------------------------------------
    // STORY LINES
    // -----------------------------------------

    storyLines.innerHTML = "";


    section.sentences.forEach(sentenceNumber => {

        const sentence =
            currentBook.sentences.find(
                item => item.number === sentenceNumber
            );


        if (!sentence) {
            return;
        }


        const line = document.createElement("p");

        line.className = "story-line";


        line.innerHTML = escapeHTML(sentence.text);


        storyLines.appendChild(line);

    });


    // -----------------------------------------
    // BUTTON TEXT
    // -----------------------------------------

    if (
        currentSectionIndex ===
        currentBook.readingSections.length - 1
    ) {

        nextButton.textContent =
            "Finish Book ✓";

    }

    else {

        nextButton.textContent =
            "Next →";

    }


    // Return to top when a new section appears

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



// =============================================
// NEXT BUTTON
// =============================================

nextButton.addEventListener(
    "click",
    function() {

        currentSectionIndex++;

        showReadingSection();

    }
);



// =============================================
// FINISHED SCREEN
// =============================================

function showFinishedScreen() {

    storySoFarBox.style.display = "none";

    storyLines.innerHTML = `
        <div class="finished-message">

            <h2>🎉 Great Reading!</h2>

            <p>
                You finished
                <strong>${escapeHTML(currentBook.title)}</strong>.
            </p>

        </div>
    `;


    nextButton.style.display = "none";

}



// =============================================
// SAFE TEXT DISPLAY
// =============================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}
