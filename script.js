const emojiListElement = document.querySelector('.emoji-list');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');

function convertHTMLCodeToEmoji(htmlCode) {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = htmlCode;
  return tempElement.textContent;
}

function convertUnicodeToFlagEmoji(unicode) {
  const codePoints = unicode.map(u => parseInt(u.slice(2), 16));
  return String.fromCodePoint(...codePoints);
}

function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

fetch('https://emojihub.yurace.pro/api/all')
  .then(response => response.json())
  .then(data => {
    displayEmojis(data);
    setupFiltering(data);
  })
  .catch(error => console.error('Error fetching emojis:', error));

function displayEmojis(emojis) {
  emojiListElement.innerHTML = ''; 
  emojis.forEach(emoji => {
    const emojiCard = document.createElement('div');
    emojiCard.classList.add('emoji-card');
    const isFlagEmoji = emoji.category.toLowerCase() === 'flags' && emoji.htmlCode.length === 2;
    const emojiContent = isFlagEmoji
      ? getFlagEmoji(convertUnicodeToFlagEmoji(emoji.unicode))
      : convertHTMLCodeToEmoji(emoji.htmlCode[0]);
    emojiCard.innerHTML = `
      <p><strong>Name</strong>: ${emoji.name}</p>
      <p><strong>Category</strong>: ${emoji.category}</p>
      <p><strong>Group</strong>: ${emoji.group}</p>
      <p><strong>Emoji</strong>: <span>${emojiContent}</span></p>`;
    emojiListElement.appendChild(emojiCard);
  });
}


function getUniqueCategories(emojis) {
  const categoriesSet = new Set(emojis.map(emoji => emoji.category));
  return ['All', ...categoriesSet];
}


function populateFilterOptions(emojis) {
  const categories = getUniqueCategories(emojis);
  filterSelect.innerHTML = '';

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.toLowerCase();
    option.textContent = category;
    filterSelect.appendChild(option);
  });
}


function setupFiltering(emojis) {
  searchInput.addEventListener('input', () => filterEmojis(emojis));
  filterSelect.addEventListener('change', () => filterEmojis(emojis));

  
  populateFilterOptions(emojis);
}

function filterEmojis(emojis) {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = filterSelect.value.toLowerCase();

  const filteredEmojis = emojis.filter(emoji => {
    const nameMatch = emoji.name.toLowerCase().includes(searchTerm);
    const categoryMatch = selectedCategory === 'all' || emoji.category.toLowerCase() === selectedCategory;
    return nameMatch && categoryMatch;
  });

  displayEmojis(filteredEmojis);
}
