function formatPrices() {
  const prices = document.querySelectorAll('.price');

  prices.forEach((node) => {
    node.textContent = new Intl.NumberFormat('en-EN', {
      currency: 'usd',
      style: 'currency',
    }).format(node.textContent);
  });
}

function formatDate() {
  const dates = document.querySelectorAll('.date');

  dates.forEach((date) => {
    date.textContent = new Intl.DateTimeFormat('en-EN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date.textContent));
  });
}

function reloadPage() {
  const deleteButtons = document.querySelectorAll('[data-action="delete"]');
  const addButtons = document.querySelectorAll('[data-action="add"]');

  deleteButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      await fetch('/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': button.getAttribute('data-csrf'),
        },
        body: JSON.stringify({
          id: button.getAttribute('data-id'),
        }),
      })
        .then((res) => res.json())
        .then(updateCart);
    });
  });

  addButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      await fetch('/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': button.getAttribute('data-csrf'),
        },
        body: JSON.stringify({
          id: button.getAttribute('data-id'),
          isFetch: true,
        }),
      })
        .then((res) => res.json())
        .then(updateCart);
    });
  });

  formatPrices();
  formatDate();
}

function updateCart({courses, csrf}) {
  const cartBlock = document.querySelector('.cart');

  if (courses.length > 0) {
    const html = courses
      .map(({ title, count, price, _id }) => {
        return `
        <tr>
            <td>${title}</td>
            <td>${count}</td>
            <td class="price small">${price}</td>
            <td>
              <button
                class='btn btn-small'
                data-action='add'
                data-id=${_id}
                data-csrf=${csrf}
              >Add</button>
              <button
                class='btn btn-small'
                data-action='delete'
                data-id=${_id}
                data-csrf=${csrf}
              >Delete</button>
            </td>
          </tr>
      `;
      })
      .join('');

    let price = 0;
    courses.forEach((course) => (price += course.price * course.count));

    cartBlock.querySelector('tbody').innerHTML = html;
    cartBlock.querySelector('.price-total').textContent = price;
    reloadPage();
  } else {
    cartBlock.innerHTML = `<p>You didn't add anything yet.</p>`;
  }
}

reloadPage();
M.Tabs.init(document.querySelectorAll('.tabs'));
