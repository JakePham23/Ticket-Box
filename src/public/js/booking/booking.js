const ticketsContainer = document.getElementById('tickets');
const pricingContainer = document.getElementById('pricing');
const totalTicketsElement = document.getElementById('total-tickets');
const totalPriceElement = document.getElementById('total-price');
const bookNowBtnElement = document.getElementById('booknow-btn');
const stageLayoutBtnElement = document.getElementById('stagelayout-btn');
const rawTicketTypeInfo = decodeURIComponent(ticketsContainer.dataset.ticketInfo);
const ticketData = JSON.parse(rawTicketTypeInfo);
// NOTE: biến quantity là số lượng đang chọn của mỗi loại vé, còn ticket.quantity là số vé còn lại của loại vé đấy trong db

// Số vé hiển thị trên mỗi trang
const ticketsPerPage = 3;

// Biến quản lý trạng thái trang hiện tại
let currentPage = 1;

// Tính tổng số trang
const totalPages = Math.ceil(ticketData.length / ticketsPerPage);

let selectedTickets = {};

// Hàm lưu thông tin vé đã chọn vào localStorage
const saveBookingToStorage = () => {
  const ticketsArray = ticketData.map(ticket => ({
      ticketTypeID: ticket.ticketTypeID,
      quantity: selectedTickets[ticket.name] || 0,
      price: ticket.price
  })).filter(ticket => ticket.quantity > 0); // Chỉ lưu những vé có số lượng > 0

  if (ticketsArray.length > 0) {
      localStorage.setItem('selectedTickets', JSON.stringify(ticketsArray));
  } else {
      localStorage.removeItem('selectedTickets');
  }
};

// Hàm cập nhật tổng số vé và tổng giá tiền
const updateOrderSummary = () => {
    pricingContainer.innerHTML = '';
    let totalTickets = 0;
    let totalPrice = 0;

    for (const ticketName in selectedTickets) {
      const quantity = selectedTickets[ticketName];
      if (quantity > 0) {
        const ticket = ticketData.find(t => t.name === ticketName);
        const price = ticket.price * quantity;
        pricingContainer.innerHTML += `
          <div class="pricing-item">
            <span>${ticketName} x${quantity}</span>
            <span>${price.toLocaleString()}₫</span>
          </div>
        `;
        totalTickets += quantity;
        totalPrice += price;
      }
    }

    totalTicketsElement.textContent = totalTickets;
    totalPriceElement.textContent = totalPrice.toLocaleString() + '₫';
    
    // Lưu vào localStorage mỗi khi cập nhật
    saveBookingToStorage();
};

// Hàm cập nhật số lượng vé
const updateTicket = (ticketName, delta) => {
    const currentQuantity = selectedTickets[ticketName];
    const newQuantity = Math.max(0, currentQuantity + delta);
    selectedTickets[ticketName] = newQuantity;

    document.getElementById(`quantity-${ticketName}`).value = newQuantity;
    updateOrderSummary();
};

// Hàm xử lý sự kiện input
const handleInput = (ticketName) => {
    const inputElement = document.getElementById(`quantity-${ticketName}`);
    const value = parseInt(inputElement.value, 10) || 0;
    selectedTickets[ticketName] = Math.max(0, value);
    updateOrderSummary();
};


// Hàm render vé của trang hiện tại
const renderTickets = () => {
    ticketsContainer.innerHTML = '';
    
    const start = (currentPage - 1) * ticketsPerPage;
    const end = Math.min(start + ticketsPerPage, ticketData.length);

    for (let i = start; i < end; i++) {
      const ticket = ticketData[i];
      selectedTickets[ticket.name] = selectedTickets[ticket.name] || 0;

      const ticketElement = document.createElement('div');
      ticketElement.className = 'ticket';

      ticketElement.innerHTML = `
        <div class="ticket-info">
          <strong>${ticket.name}</strong>
          <p>${`${ticket.price.toLocaleString()}₫`}</p>
        </div>
        <div class="ticket-quantity">
          ${ticket.quantity === 0 ? '<div class="sold-out">Sold Out</div>' : `
            <button class="btn" >-</button>
            <input type="number" value="${selectedTickets[ticket.name]}" min="0" id="quantity-${ticket.name}">
            <button class="btn" >+</button>
          `}
        </div>
        <div class="ticket-benefit">
          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 96 960 960" width="24" fill="#000">
            <path d="M480 976q-83 0-156.5-31.5T198 860q-54-54-85.5-127.5T81 576q0-83 31.5-156.5T198 292q54-54 127.5-85.5T480 176q83 0 156.5 31.5T762 292q54 54 85.5 127.5T879 576q0 83-31.5 156.5T762 860q-54 54-127.5 85.5T480 976Zm-33-401h66v-270h-66v270Zm0 162h66v-66h-66v66ZM480 900q146 0 248-102t102-248q0-146-102-248T480 200q-146 0-248 102T130 576q0 146 102 248t248 102Z"/>
          </svg>
          <p class="benefit-text">${ticket.description}</p>
        </div>
      `;

      ticketsContainer.appendChild(ticketElement);
    }

    updatePaginationControls();
};

// Hàm cập nhật trạng thái nút phân trang
const updatePaginationControls = () => {
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    // Cập nhật trạng thái nút
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    // Hiển thị thông tin trang
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
};

// Hàm thay đổi trang
const changePage = (delta) => {
    currentPage = Math.min(Math.max(1, currentPage + delta), totalPages);
    renderTickets();
};

// Khởi tạo
updateOrderSummary();
renderTickets();

// Cập nhật event listener cho nút Book Now
bookNowBtnElement.addEventListener('click', () => {
  const selectedTicketsArray = JSON.parse(localStorage.getItem('selectedTickets') || '[]');
  if (selectedTicketsArray.length > 0) {
      let url = new URL(window.location.href);
      url.pathname += '/info';
      window.location.href = url.toString();
  } else {
      alert('Vui lòng chọn ít nhất một vé');
  }
});

// Thêm event listeners khi document đã load
document.addEventListener('DOMContentLoaded', () => {
  // Pagination buttons
  document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
  document.getElementById('nextPage').addEventListener('click', () => changePage(1));

  ticketsContainer.addEventListener('click', (event) => {
    // Kiểm tra nếu click vào nút tăng/giảm số lượng
    if (event.target.matches('.btn')) {
      const ticketElement = event.target.closest('.ticket');
      const ticketType = ticketElement.querySelector('.ticket-info strong').textContent;
      const isIncrease = event.target.textContent === '+';
      updateTicket(ticketType, isIncrease ? 1 : -1);
    }
  });

    // Xử lý input change
  ticketsContainer.addEventListener('input', (event) => {
    if (event.target.matches('input[type="number"]')) {
        const ticketType = event.target.closest('.ticket').querySelector('.ticket-info strong').textContent;
        handleInput(ticketType);
    }
  });
});