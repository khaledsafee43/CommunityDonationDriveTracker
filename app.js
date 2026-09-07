let cards = document.getElementById("cards-container");
fetch("data.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    const cardss = data.map((jsonData) => {
      return `
            <div class="card">
                <h3 class="item-title">${jsonData.item}</h3>
              <p>دریافت‌شده: <span>60</span> از <span>100</span></p>
              <p>باقی‌مانده: <span>40</span></p>
              <p>پیشرفت: <span>60%</span></p>
              <span class="badge warning">هنوز نیاز است</span>
            </div>
        `;
    });
    cards.innerHTML = cardss.json("")
  });
