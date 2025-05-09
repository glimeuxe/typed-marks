import {getFirestore, collection, getDocs, enableIndexedDbPersistence} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

const app = firebase.app();
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
    console.warn('Persistence error:', err.code);
  }
});

window.onload = () => {
	const input = document.getElementById("search");
	input.value = ".";
	searchUrls();
	input.value = "";
	input.focus();

	setInterval(() => {
		const active = document.activeElement;
		if (active !== input) input.focus();
	}, 1);

	input.addEventListener("keydown", async (e) => {
		if (e.key === "Enter") {
			await searchUrls();
			const links = document.querySelectorAll("#results a");
			if (links.length > 0) {
				window.open(links[0].href, '_blank');
			}
		}
	});

	document.addEventListener("keydown", (e) => {
		const isMac = navigator.platform.toUpperCase().includes("MAC");
		const isCtrlL = (!isMac && e.ctrlKey && e.key === "l");
		const isCmdL = (isMac && e.metaKey && e.key === "l");
		if (isCtrlL || isCmdL) {
			e.preventDefault();
			input.focus();
		}
	});
};

async function searchUrls() {
	const q = document.getElementById("search").value.toLowerCase();
	const resultsList = document.getElementById("results");
	const bookmarksRef = collection(db, "bookmarks");
	const snapshot = await getDocs(bookmarksRef);
	const filtered = [];

	snapshot.forEach(doc => {
		const { url, name = "" } = doc.data();
		if (url.toLowerCase().includes(q) || name.toLowerCase().includes(q)) {
			filtered.push([url, name]);
		}
	});

	resultsList.innerHTML = filtered.map(([url, name]) =>
		`${name ? name + " - " : ""}<li><a href="${url}" target="_blank">${url}</a></li>`
	).join("<br>");
}