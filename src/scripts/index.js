import '@babel/polyfill';
import LazyLoad from "vanilla-lazyload";
import moment from 'moment';
import Swiper from 'swiper';
import '../styles/base.scss';

import { getHotels, getReviews } from './api';

const myLazyLoad = new LazyLoad({
  // set default image when image couldn't loaded
  callback_error: (element) => {
    element.src ="./src/images/placeholder-1-1.jpg";
  },
});

const render = (template, selector) => {
	var node = document.querySelector(selector);
	if (!node) return;
	node.innerHTML = template;
};

const addHotelsToDOM = hotels => {
  let template = ''
  const starTotal = 5;

  if (Array.isArray(hotels) && hotels.length > 0) {
    hotels.map((hotel, index) => {
      const starPercentage = (hotel.stars / starTotal) * 100;
      const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
      let images = ''

      if (hotel.images.length > 0) {
        hotel.images.map(image => images += `<a href="${image}" data-lightbox="${hotel.name}"><img data-src="${image}" src="./src/images/placeholder-1-1.jpg" data-lightbox="ss" alt="${hotel.name}" /></a>`)
      } else {
        images = '<div>No images</div>'
      }

      template += `
        <div class="hotel-item">
          <div class="hotel-item__wrapper">
            <div class="hotel-item__thumbnail">
              <img data-src="${hotel.images[0]}" src="./src/images/placeholder-1-1.jpg" alt="${hotel.name}">
            </div>
            <div class="hotel-item__container">
              <div class="hotel-item__detail">
                <h4 class="hotel-item__detail__name">${hotel.name}</h4>
                <p>${hotel.city}, ${hotel.country}</p>
                <p><strong>${hotel.description}</strong></p>
              </div>
              <div class="hotel-item__review">
                <div class="hotel-item__review__score">
                  <div class="stars-outer">
                    <div class="stars-inner" style="width: ${starPercentageRounded};"></div>
                  </div>
                </div>
                <div class="hotel-item__room_info">
                  ${moment(hotel.date_end).diff(moment(hotel.date_start), 'days')} Nights Total Amount
                </div>
                <div class="hotel-item__price">
                  ${hotel.price} €
                </div>
                <div class="hotel-item__action_container">
                  <button class="btn btn-detail" data-toggle="collapse" data-target="#detail-tab-${index}" data-hotel-id="${hotel.id}">
                    Quick Look <i class="fa fa-angle-down"></i>
                  </button>
                  <a class="btn btn-select" href="/">Book Hotel</a>
                </div>
              </div>
            </div>
          </div>
          <div class="hotel-item__quick_look" id="detail-tab-${index}">
            <div class="tab-list">
              <button class="btn btn-tab" data-toggle="tab" data-target="#gallery-tab-${index}">Gallery</button>
              <button class="btn btn-tab" data-toggle="tab" data-target="#comments-tab-${index}">Comments</button>
            </div>
            <div class="tab-content">
              <div id="gallery-tab-${index}" class="tab hotel-gallery active">
                ${images}
              </div>
              <div id="comments-tab-${index}" class="tab hotel-comments">
                <div class="comments-title"></div>
                <div class="swiper-container">
                  <div class="swiper-wrapper"></div>
                  <div class="swiper-button-prev"></div>
                  <div class="swiper-button-next"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        `;
    });
  } else {
    template = `
      <div class="error-container">
        <h4>The ship sinks! Reflesh the page.</h4>
        <img src="./src/images/error.gif" />
      </div>
    `
  }
  // render hotels
  render(template, '.hotel-container')
  // update lazyload after render the hotels
  myLazyLoad.update();

  const triggers = Array.from(document.querySelectorAll('[data-toggle="collapse"]'));
  const tabs = Array.from(document.querySelectorAll('[data-toggle="tab"]'));

  window.addEventListener('click', async (ev) => {
    const elm = ev.target;

    // to open quick look
    if (triggers.includes(elm)) {
      const selector = elm.getAttribute('data-target');
      const hotelId = elm.getAttribute('data-hotel-id');
      const icon = elm.querySelector('i');
      // TODO: add store2 to get it from localstorage, don't make unnecessary api calls
      const comments = await getReviews({ hotel_id: hotelId })

      let commentTemplate = ''
      let template = ''
      let positiveCommentCount = 0

      if (comments.length > 0) {
        comments.map((comment) => {
          positiveCommentCount += comment.positive ? 1 : 0
          commentTemplate += `
            <div class="swiper-slide">
              <div>
                <h4>${comment.name} <span>${comment.positive ? 'recommends!' : 'does not recommend.'}</span></h4>
                <p>${comment.comment}</p>
              </div>
            </div>
          `
        })
        template += `
          <h4>
            ${positiveCommentCount} out of ${comments.length} people recommend this hotel.
          </h4>
        `
      } else {
        template = `
          <div>
            <h4>There is no comment for this hotel.</h4>
            <img src="./src/images/not-found.gif" />
          </div>
        `
      }

      // render comments
      icon.closest('.hotel-item').querySelector('.comments-title').innerHTML = template
      icon.closest('.hotel-item').querySelector('.swiper-wrapper').innerHTML = commentTemplate

      // initialize the swiper after content renders
      const mySwiper = new Swiper('.swiper-container', {
        loop: true,
        autoplay: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });

      // change quick look icon
      icon.classList.contains('fa-angle-down') ? icon.className = 'fa fa-angle-up' : icon.className = 'fa fa-angle-down'
      // toggle quick look collapse
      collapse(selector, 'toggle');
    }
    // to change quick look tabs
    else if (tabs.includes(elm)) {
      const selector = elm.getAttribute('data-target');
      const ss = document.querySelector(selector)
      ss.closest('.hotel-item').querySelector('.tab.active').classList.remove('active')
      ss.classList.add('active')
    }
  }, false);

  const fnmap = {
    'toggle': 'toggle',
    'show': 'add',
    'hide': 'remove'
  };

  const collapse = (selector, cmd) => {
    const targets = Array.from(document.querySelectorAll(selector));
    targets.forEach(target => {
      target.classList[fnmap[cmd]]('show');
    });
  }
};

// render first hotels by default values
const main = async () => {
  addHotelsToDOM(await getHotels({ min_stars: 3 }));
};

main();

// filter hotels
const filterBtn = document.getElementById('btnFilter')
filterBtn.addEventListener('click', async (event) => {
  const filterStart = document.getElementById('drpStar')
  const filterPrice = document.getElementById('txtPrice')
  addHotelsToDOM(await getHotels({ min_stars: filterStart.value, price: filterPrice.value }));
})
