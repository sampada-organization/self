(function ($) {
	"use strict";

	// Preloader removed site-wide for faster first paint (text/layout first).
	$(".site-preloader-wrap, .slide-preloader-wrap").remove();

	// Mobile Menu
	function isMobileNav() {
		return window.matchMedia("(max-width: 991.98px)").matches;
	}

	$(".navbar-toggler").on("click", function () {
		var $btn = $(this);
		// Bootstrap toggles aria-expanded after click; sync class next tick
		window.setTimeout(function () {
			var open = $btn.attr("aria-expanded") === "true";
			$btn.toggleClass("active", open);
			$btn.closest(".site-nav").toggleClass("is-open", open);
			$btn.closest(".site-nav__navbar").toggleClass("menu-open", open);
		}, 0);
	});

	// Accordion submenus: parents are labels only (not page links).
	// Contact and any item without .sub-menu stay normal links.
	function setSubmenuOpen($li, open) {
		var $sub = $li.children(".sub-menu");
		var $link = $li.children("a.nav-link, a.nav-link--parent");
		var $toggler = $li.find("> a .sub-nav-toggler");
		$li.toggleClass("is-open", open);
		$link.attr("aria-expanded", open ? "true" : "false");
		$toggler.toggleClass("active", open);
		if (!$sub.length) return;
		if (isMobileNav()) {
			$sub.stop(true, true)[open ? "slideDown" : "slideUp"](180);
		} else {
			// Desktop uses CSS hover; keep class in sync for click-open if used
			$sub.css("display", "");
		}
	}

	function closeSiblingSubmenus($li) {
		$li.siblings(".nav-item").each(function () {
			setSubmenuOpen($(this), false);
		});
	}

	var $navItems = $(".site-nav .navbar-nav > .nav-item");
	$navItems.each(function () {
		var $li = $(this);
		var $sub = $li.children(".sub-menu");
		if (!$sub.length) return;
		$li.addClass("has-sub");
		var $link = $li.children("a.nav-link");
		$link.addClass("nav-link--parent");
		// Never navigate: parents only expand/collapse children
		if ($link.attr("href") && $link.attr("href") !== "#") {
			$link.attr("href", "#");
		}
		$link.attr({ role: "button", "aria-haspopup": "true", "aria-expanded": "false" });
		if ($link.find(".sub-nav-toggler").length) return;
		$link.css("position", "relative");
		$link.append(
			'<button type="button" class="sub-nav-toggler" aria-label="Toggle submenu" tabindex="-1"><i class="fa fa-angle-down"></i></button>'
		);
	});

	$(document).on("click", ".site-nav .sub-nav-toggler", function (e) {
		e.preventDefault();
		e.stopPropagation();
		var $li = $(this).closest(".nav-item");
		var open = !$li.hasClass("is-open");
		closeSiblingSubmenus($li);
		setSubmenuOpen($li, open);
		return false;
	});

	// Parent labels: always toggle submenu, never follow a page URL
	// (Contact has no .sub-menu so it is unaffected)
	$(document).on("click", ".site-nav .navbar-nav > .nav-item > a.nav-link", function (e) {
		var $li = $(this).closest(".nav-item");
		var $sub = $li.children(".sub-menu");
		if (!$sub.length) return; // Contact / leaf items keep normal click

		e.preventDefault();
		e.stopPropagation();

		// Mobile: accordion open/close. Desktop: hover shows menu; click still toggles class.
		if (isMobileNav()) {
			var open = !$li.hasClass("is-open");
			closeSiblingSubmenus($li);
			setSubmenuOpen($li, open);
		} else {
			// Prevent jump to # and optional click-to-pin open on desktop
			var openDesk = !$li.hasClass("is-open");
			$li.siblings(".nav-item").removeClass("is-open");
			$li.toggleClass("is-open", openDesk);
			$(this).attr("aria-expanded", openDesk ? "true" : "false");
		}
		return false;
	});

	//Home Page Slide
	if ($.fn.owlCarousel && $(".homepage-slides").length) {
		$(".homepage-slides").owlCarousel({
			items: 1,
			dots: false,
			nav: true,
			loop: true,
			autoplay: true,
			autoplayTimeout: 5000,
			navText: ["<i class='la la-angle-left'></i>", "<i class='la la-angle-right'></i>"]
		});

		$(".homepage-slides").on("translate.owl.carousel", function () {
			$(".single-slide-item h1").removeClass("animated fadeInUp").css("opacity", "1");
			$(".single-slide-item h5").removeClass("animated fadeInDown").css("opacity", "1");
		});

		$(".homepage-slides").on("translated.owl.carousel", function () {
			$(".single-slide-item h1").addClass("animated fadeInUp").css("opacity", "1");
			$(".single-slide-item h5").addClass("animated fadeInDown").css("opacity", "1");
		});
	}


	//jQuery Sticky Area
	if ($.fn.sticky && $(".sticky-area").length) {
		$(".sticky-area").sticky({
			topSpacing: 0,
		});
	}

	//Progress Bar JS

	$("#bar1").barfiller({
		barColor: "var(--red)",
		duration: 5000,
	});

	$("#bar2").barfiller({
		barColor: "var(--red)",
		duration: 6000,
	});

	$("#bar3").barfiller({
		barColor: "var(--red)",
		duration: 7000,
	});

	$("#bar4").barfiller({
		barColor: "var(--red)",
		duration: 5000,
	});

	$("#bar5").barfiller({
		barColor: "var(--red)",
		duration: 6000,
	});

	$("#bar6").barfiller({
		barColor: "var(--red)",
		duration: 7000,
	});

	// Counter Up only on plain numeric spans (not Cr/Lakh formatted stats)
	if ($.fn.counterUp) {
		$(".counter-number span[data-counter]").counterUp({
			delay: 10,
			time: 1000,
		});
	}

	// Testimonial Carousel

	$('.team-carousel').owlCarousel({
		items: 1,
		margin: 30,
		dots: false,
		nav: false,
		loop: true,
		autoplay: true,
		responsiveClass: true,
		responsive: {
			575: {
				items: 1,
				nav: false,
				dots: false,
			},

			767: {
				items: 2,
				nav: false
			},

			990: {
				items: 2,
				loop: true,

			},
			1200: {
				items: 3,
				dots: true,
				loop: true,
			}
		}
	});


	// Logo Carousel 

	$('.logo-carousel').owlCarousel({
		items: 4,
		margin: 15,
		dots: false,
		nav: false,
		loop: true,
		autoplay: true,
	});


	//Isotope Filter

	$('.port-menu li').on('click', function () {
		var selector = $(this).attr('data-filter');

		$('.port-menu li').removeClass("active");

		$(this).addClass("active");

		$(".portfolio-list").isotope({
			filter: selector,
			percentPosition: true,
		});

	});


	//jQuery Animation  
	new WOW().init(

	);


	// SCROLLTO THE TOP

	// Show or hide the sticky footer button
	$(window).on("scroll", function () {
		if ($(this).scrollTop() > 6000) {
			$('.go-top').fadeIn(200);
		} else {
			$('.go-top').fadeOut(200);
		}
	});


	// Animate the scroll to top
	$('.go-top').on("click", function (event) {
		event.preventDefault();

		$('html, body').animate({
			scrollTop: 0
		}, 1500);
	});


	//Magnific Pop-up

	$('.video-play-btn').magnificPopup({
		type: 'iframe'

	});


	// Service cards may still use hover highlight (not testimonials)
	$(".single-service-item").on("mouseover", function () {
		$(".single-service-item").removeClass("active");
		$(this).addClass("active");
	});


	// Menu Active Color 

	$(".main-menu .navbar-nav .nav-link").on("click", function () {
		$(".main-menu .navbar-nav .nav-link").removeClass("active");
		$(this).addClass("active");
	});

	// Contact → scroll to Get in Touch form + attention animation
	function focusGetInTouch() {
		var $box = $("#get-in-touch");
		if (!$box.length) return;

		// Close mobile menu if open
		var $collapse = $("#navbarSupportedContent");
		if ($collapse.hasClass("show")) {
			$collapse.collapse("hide");
			$(".navbar-toggler").removeClass("active").attr("aria-expanded", "false");
		}

		var top = $box.offset().top - 90;
		$("html, body").stop(true).animate({ scrollTop: Math.max(0, top) }, 550, function () {
			$box.removeClass("contact-attention");
			// reflow so animation restarts
			void $box[0].offsetWidth;
			$box.addClass("contact-attention");
			var $first = $box.find("input, textarea").filter(":visible").first();
			if ($first.length) {
				try {
					$first.trigger("focus");
				} catch (e) {}
			}
			window.setTimeout(function () {
				$box.removeClass("contact-attention");
			}, 2200);
		});
	}

	$(document).on("click", 'a[href="#get-in-touch"], a[href="#footer-link"], a.js-contact-focus', function (e) {
		var href = $(this).attr("href") || "";
		if (href.indexOf("#get-in-touch") === -1 && href.indexOf("#footer-link") === -1 && !$(this).hasClass("js-contact-focus")) {
			return;
		}
		// same-page anchors only
		var path = this.pathname || "";
		var here = window.location.pathname || "";
		if (path && path !== here && path.replace(/\/$/, "") !== here.replace(/\/$/, "")) {
			return; // let browser navigate if different page
		}
		e.preventDefault();
		if (history.replaceState) {
			history.replaceState(null, "", "#get-in-touch");
		}
		focusGetInTouch();
	});

	if (window.location.hash === "#get-in-touch" || window.location.hash === "#footer-link") {
		window.setTimeout(focusGetInTouch, 350);
	}

}(jQuery));
