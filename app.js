const apiUrlBase = "https://api.aladhan.com/v1/timingsByCity?method=2";
const prayerTimesContainer = document.getElementById("prayer-times");
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Fetch prayer times based on user's location
async function fetchPrayerTimes(city, country) {
    try {
        const response = await fetch(`${apiUrlBase}&city=${city}&country=${country}`);
        const data = await response.json();
        const timings = data.data.timings;
        
        prayerTimesContainer.innerHTML = `
            <p>Fajr: ${timings.Fajr}</p>
            <p>Dhuhr: ${timings.Dhuhr}</p>
            <p>Asr: ${timings.Asr}</p>
            <p>Maghrib: ${timings.Maghrib}</p>
            <p>Isha: ${timings.Isha}</p>
        `;
        
        scheduleNotifications(timings);
    } catch (error) {
        prayerTimesContainer.innerHTML = "<p>Error fetching prayer times</p>";
    }
}

// Get user's location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const locationData = await locationResponse.json();
            const city = locationData.address.city || locationData.address.town;
            const country = locationData.address.country;
            fetchPrayerTimes(city, country);
        }, () => {
            fetchPrayerTimes("Islamabad", "Pakistan"); // Default fallback
        });
    } else {
        fetchPrayerTimes("Islamabad", "Pakistan"); // Default fallback
    }
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

darkModeToggle.addEventListener("click", toggleDarkMode);
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}

// Schedule push notifications for prayer times
function scheduleNotifications(timings) {
    if ("Notification" in window && Notification.permission === "granted") {
        Object.entries(timings).forEach(([prayer, time]) => {
            const now = new Date();
            const prayerTime = new Date();
            const [hours, minutes] = time.split(":");
            prayerTime.setHours(hours, minutes, 0, 0);
            
            if (prayerTime > now) {
                const timeout = prayerTime - now;
                setTimeout(() => {
                    new Notification("Prayer Time Reminder", {
                        body: `It's time for ${prayer}!`,
                        icon: "icons/icon-192x192.png"
                    });
                }, timeout);
            }
        });
    }
}

// Request notification permission on page load
if ("Notification" in window) {
    Notification.requestPermission();
}

// Initialize app
document.addEventListener("DOMContentLoaded", getUserLocation);
