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
let shownReviews = new Set();
let pendingNextSectionIndex = null;
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
            shownReviews = new Set();
            pendingNextSectionIndex = null;
            
            nextButton.style.display = "inline-block";
            
            document.getElementById("reviewScreen").style.display = "none";
            
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


    const sectionSentences = section.sentences
    .map(sentenceNumber =>
        currentBook.sentences.find(
            item => item.number === sentenceNumber
        )
    )
    .filter(Boolean);


// Group nearby sentences into natural reading paragraphs.
// A new paragraph begins when the original book page changes.

let currentParagraph = null;
let currentPage = null;


sectionSentences.forEach(sentence => {

    if (
        currentParagraph === null ||
        sentence.sourcePageNumber !== currentPage
    ) {

        currentParagraph =
            document.createElement("p");

        currentParagraph.className =
            "story-paragraph";

        storyLines.appendChild(
            currentParagraph
        );

        currentPage =
            sentence.sourcePageNumber;
    }


    if (currentParagraph.textContent !== "") {
        currentParagraph.append(" ");
    }


    currentParagraph.append(
        sentence.text
    );

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

nextButton.addEventListener("click", function() {

    const section =
        currentBook.readingSections[currentSectionIndex];

    const review = findReviewForSection(section);

    if (review) {

        pendingNextSectionIndex =
            currentSectionIndex + 1;

        showReview(review);

        return;
    }

    currentSectionIndex++;

    showReadingSection();

});



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
// FIND REVIEW
// =============================================

function findReviewForSection(section) {

    if (!section || !currentBook.reviews) {
        return null;
    }

    return currentBook.reviews.find(review => {

        return (
            review.afterSentence <= section.endSentence &&
            !shownReviews.has(review.afterSentence)
        );

    }) || null;
}



// =============================================
// SHOW STORY REVIEW
// =============================================

function showReview(review) {

    const reviewScreen =
        document.getElementById("reviewScreen");

    const reviewQuestions =
        document.getElementById("reviewQuestions");


    readingScreen.style.display = "none";
    reviewScreen.style.display = "block";

    reviewQuestions.innerHTML = "";


    review.questions.forEach((item, index) => {

        const questionBlock =
            document.createElement("div");

        questionBlock.className =
            "review-question";


        const question =
            document.createElement("div");

        question.className =
            "review-question-text";

        question.textContent =
            item.question;


        const answer =
            document.createElement("div");

        answer.className =
            "review-answer";

        answer.textContent =
            item.answer;


        questionBlock.appendChild(question);
        questionBlock.appendChild(answer);

        reviewQuestions.appendChild(
            questionBlock
        );

    });


    shownReviews.add(review.afterSentence);


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



// =============================================
// CONTINUE AFTER REVIEW
// =============================================

document
    .getElementById("continueStoryButton")
    .addEventListener("click", function() {

        document.getElementById(
            "reviewScreen"
        ).style.display = "none";


        if (
            pendingNextSectionIndex >=
            currentBook.readingSections.length
        ) {

            readingScreen.style.display = "block";

            showFinishedScreen();

            return;
        }


        currentSectionIndex =
            pendingNextSectionIndex;

        pendingNextSectionIndex = null;

        showReadingSection();

    });

// =============================================
// SAFE TEXT DISPLAY
// =============================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}
