// script.js
const moodButtons = document.querySelectorAll(".mood-buttons button");
const message = document.getElementById("message");
const timeline = document.getElementById("timeline");
const calendar = document.getElementById("calendar");
const calDays = document.getElementById("cal-days");
const calMonthYear = document.getElementById("cal-month-year");
const viewButtons = document.querySelectorAll(".view-controls button");
const calPrev = document.getElementById("cal-prev");
const calNext = document.getElementById("cal-next");

let moodData = JSON.parse(localStorage.getItem("moodData")) || [];
let currentDate = new Date();
console.log(currentDate);
console.log(moodData);
let calMonth = currentDate.getMonth();
let calYear = currentDate.getFullYear();

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Log Mood - save it to local storage
// Event listener for the mood buttons
moodButtons.forEach(button => {
    button.addEventListener("click", () => {
        const mood = button.getAttribute("data-mood");
        const dateStr = currentDate.toLocaleString("en-CA").replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, "$3-$1-$2T$4").split(",")[0];
console.log(dateStr);
        if (moodData.find(entry => entry.date === dateStr)) {
            message.textContent = "Mood already logged for today!";
            return;
        }

        moodData.push({ date: dateStr, mood });
        localStorage.setItem("moodData", JSON.stringify(moodData));
        message.textContent = `Logged ${mood} for ${dateStr}`;
        renderView();
    });
});

// View Switching
viewButtons.forEach(button => {
    button.addEventListener("click", () => {
        viewButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const view = button.id.split("-")[0];
        if (view === "calendar") {
            timeline.classList.add("hidden");
            calendar.classList.remove("hidden");
            renderCalendar();
        } else {
            calendar.classList.add("hidden");
            timeline.classList.remove("hidden");
            renderTimeline(view);
        }
    });
});

// Render Timeline
function renderTimeline(view) {
    timeline.innerHTML = "";
    const filteredData = filterDataByView(view);

    filteredData.forEach(entry => {
        const div = document.createElement("div");
        console.log(entry.date);
        div.textContent = `${entry.date}: ${getEmoji(entry.mood)} (${entry.mood})`;
        timeline.appendChild(div);
    });

    if (filteredData.length === 0) {
        timeline.textContent = "No moods logged for this view.";
    }
}


// Mood Emoji Helper
function getEmoji(mood) {
    const emojis = {
        happy: "😊",
        sad: "😢",
        neutral: "😐",
        excited: "😃",
        angry: "😠"
    };
    return emojis[mood] || "";
}

// Filter Data by View
function filterDataByView(view) {
    const today = new Date();
    // console.log(today);
    if (view === "day") {
        const dateStr = today.toLocaleString("en-CA").replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, "$3-$1-$2T$4").split(",")[0];
        console.log(dateStr);
        return moodData.filter(entry => entry.date === dateStr);
    } else if (view === "week") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return moodData.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= weekStart && entryDate <= weekEnd;
        });
    } else if (view === "month") {
        return moodData.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === today.getMonth() && entryDate.getFullYear() === today.getFullYear();
        });
    }
    return moodData;
}

// Render Calendar
function renderCalendar() {
    calDays.innerHTML = "";
    calMonthYear.textContent = `${months[calMonth]} ${calYear}`;

    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = document.createElement("div");
        day.textContent = prevMonthDays - i;
        day.classList.add("inactive");
        calDays.appendChild(day);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement("div");
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        const moodEntry = moodData.find(entry => entry.date === dateStr);
        day.textContent = i + (moodEntry ? ` ${getEmoji(moodEntry.mood)}` : "");
        
        if (
            i === currentDate.getDate() &&
            calMonth === currentDate.getMonth() &&
            calYear === currentDate.getFullYear()
        ) {
            day.classList.add("today");
        }
        calDays.appendChild(day);
    }

    // Next month padding
    const totalCells = firstDay + daysInMonth;
    const nextDays = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let i = 1; i <= nextDays; i++) {
        const day = document.createElement("div");
        day.textContent = i;
        day.classList.add("inactive");
        calDays.appendChild(day);
    }
}

// Calendar Navigation to the previous month
calPrev.addEventListener("click", () => {
    calMonth--;
    if (calMonth < 0) {
        calMonth = 11;
        calYear--;
    }
    renderCalendar();
});

// adds navigation to the next month
calNext.addEventListener("click", () => {
    calMonth++;
    if (calMonth > 11) {
        calMonth = 0;
        calYear++;
    }
    renderCalendar();
});



// Initial Render - Default to Day View
// Function to render the view
function renderView() {
    const activeView = document.querySelector(".view-controls .active").id.split("-")[0];
    if (activeView === "calendar") {
        renderCalendar();
    } else {
        renderTimeline(activeView);
    }
}

document.getElementById("day-view").classList.add("active"); // Default view
renderTimeline("day");
if (moodData.length > 0) {
    message.textContent = "Welcome back! Log or view your moods.";
} else {
    message.textContent = "Start by logging your mood!";
}