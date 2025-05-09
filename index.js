import { getApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js"
import { getFirestore, collection, getDocs, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js"

const app = getApp()
const db = getFirestore(app)

enableIndexedDbPersistence(db).catch(err => {
	if (["failed-precondition", "unimplemented"].includes(err.code)) {
		console.warn("Persistence error:", err.code)
	}
})

window.onload = () => {
	const input = document.getElementById("search")
	input.value = "."
	searchURLs()
	input.value = ""
	input.focus()

	setInterval(() => {
		if (document.activeElement !== input) input.focus()
	}, 1)

	input.addEventListener("keydown", async e => {
		if (e.key === "Enter") {
			await searchURLs()
			const links = document.querySelectorAll("#results a")
			if (links.length) window.open(links[0].href, "_blank")
		}
	})

	document.addEventListener("keydown", e => {
		const isMac = navigator.platform.toUpperCase().includes("MAC")
		if ((e.ctrlKey && !isMac || e.metaKey && isMac) && e.key === "l") {
			e.preventDefault()
			input.focus()
		}
	})
}

function normaliseURL(rawURL) {
	return rawURL.startsWith("http://") || rawURL.startsWith("https://")
		? rawURL
		: `https://${rawURL}`
}

async function searchURLs() {
	const q = document.getElementById("search").value.toLowerCase()
	const resultsList = document.getElementById("results")
	const snapshot = await getDocs(collection(db, "bookmarks"))
	const results = []

	snapshot.forEach(doc => {
		const { url: rawURL, name = "" } = doc.data()
		const url = normaliseURL(rawURL)
		if (url.toLowerCase().includes(q) || name.toLowerCase().includes(q)) {
			results.push({ rawURL, url, name })
		}
	})

	results.sort((a, b) => a.url.localeCompare(b.url))
	const maxURLlength = 42
	resultsList.innerHTML = results.map(({ rawURL, url, name }) =>
		`${name ? name + " - " : ""}<li><a href="${url}" target="_blank">${rawURL.length > maxURLlength ? rawURL.slice(0, maxURLlength) + "..." : rawURL}</a></li>`
	).join("")
}

window.searchURLs = searchURLs