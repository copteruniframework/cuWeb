export function cuListSort() {
    const containers = document.querySelectorAll('[cu-list-sort="abc"]');

    containers.forEach(container => {
        const items = Array.from(container.children);

        items.sort((a, b) =>
            a.textContent.trim().localeCompare(b.textContent.trim(), "de", { sensitivity: "base" })
        );

        items.forEach(item => container.appendChild(item));
    });
}