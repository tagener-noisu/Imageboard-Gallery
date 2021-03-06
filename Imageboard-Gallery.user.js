// ==UserScript==
// @name        Imageboard-Gallery
// @namespace   dot.noisu
// @include     https://2ch.hk/*/res/*
// @include     https://2ch.pm/*/res/*
// @include     http://dobrochan.ru/*/res/*
// @include     http://dobrochan.com/*/res/*
// @include     https://dobrochan.net/*/res/*
// @include     https://boards.4chan.org/*/thread/*
// @version     2.0.9.2
// @grant       none
// ==/UserScript==

/*
    Copyright (C) 2016, tagener-noisu <op4.renegat@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';

var GalleryResources = {
	css: "#gallery-wrapper { \
		position: fixed; \
		z-index: 100; \
		top: 0; \
		right: 0; \
		bottom: 0; \
		left: 0; \
		min-width: 600px; \
		min-height : 500px; \
		background-color: #272727; \
		flex-direction: column; \
	} \
	#gallery-player { \
		display: none; \
		flex: 1; \
		margin: auto; \
	} \
	#gallery-header:hover { \
		margin-top: 0; \
		margin-bottom: 0; \
		flex: 0 0 40px; \
		background-color: inherit; \
		box-shadow: 0 0 7px #111; \
	} \
	#gallery-header { \
		display: flex; \
		flex: 0 0 80px; \
		width: 100%; \
		box-sizing: border-box; \
		padding: 4px 20px; \
		z-index: 2; \
		margin-top: -40px; \
		margin-bottom: -40px; \
		transition: 100ms; \
	} \
	.header-element { \
		height: 32px; \
		color: #BBB; \
		margin: 0 2px; \
	} \
	.header-element select { \
		position: fixed; \
		height: 32px; \
		border: solid 1px #000; \
		border-radius: 4px; \
		background-color: rgba(0,0,0,0.3); \
		color: inherit; \
		text-align: center; \
	} \
	.header-button { \
		width: 32px; \
		height: 32px; \
		border: solid 1px #000; \
		border-radius: 4px; \
		cursor: pointer; \
		margin: 0 2px; \
		box-sizing: border-box; \
	} \
	.header-button.checked { \
		background-image: none; \
		background-color: rgba(0,0,0,0.3); \
	} \
	#gallery-main { \
		flex: 1;\
		overflow: hidden;\
		background-size: contain; \
		background-repeat: no-repeat; \
		background-position: center; \
		display: flex;\
		flex-direction: column;\
	} \
	#gallery-footer { \
		display: block; \
		margin: 0 auto; \
		padding: 0 10px; \
		max-width: 1200px; \
		overflow-x: auto; \
		overflow-y: hidden; \
	} \
	#gallery-footer.bottom { \
		display: flex; \
		flex: 0 0 100px;\
		padding: 0; \
		padding-top: 5px; \
		width: 100%; \
		max-width: 100%; \
		background-color: inherit; \
		background-image: inherit; \
		box-shadow: 0 0 5px #111; \
	} \
	.gallery-preview { \
		flex: 0 0 100px; \
		background-size: cover; \
		background-position: center; \
        text-decoration: none; \
	} \
	.type-preview { \
		font-size: 2em; \
		color: #FFF; \
		text-shadow: 0 0 2px #000; \
		line-height: 100px; \
		text-align: center; \
		text-decoration: none; \
	} \
	#gallery-ctrl-btn { \
		position: fixed; \
		z-index: 101; \
		width: 30px; \
		height: 30px; \
		top: 5px; \
		right: 20px; \
	} \
	#gallery-ctrl-btn.checked { \
		background-color: rgba(0,0,0,0.3); \
	} \
	#gallery-ctrl-btn svg { \
		transition: 300ms; \
		-webkit-transition: 300ms; \
	} \
	#gallery-ctrl-btn.checked svg { \
		transform: rotate(45deg); \
		-webkit-transform: rotate(45deg); \
	} \
	.anim-preload { \
		animation: 300ms linear 1s infinite loading; \
	} \
	@keyframes loading { \
			from {transform: rotate(45deg);\
			      -webkit-transform: rotate(45deg);} \
			to {transform: rotate(135deg);\
			    -webkit-transform: rotate(135deg);} \
	}",

	inner_html: '<div id="gallery-header"></div><div id="gallery-main">\
	<video id="gallery-player" controls="1" loop="1"></video></div>\
	<div id="gallery-footer" class="bottom"></div>\n',

	ctrl_btn_svg: '<svg width="30" height="30">\
	<rect height="2" width="15" x="7.5" y="14" style="fill:#bbb;"/>\
	<rect height="15" width="2" x="14" y="7.5" style="fill:#bbb;"/></svg>',

	mode_select_inner_html: '<option>Video only</option>' +
				'<option>GIF only</option>' +
				'<option>Pics only</option>' +
				'<option selected="">All</option>',

	prevs_only_icon_svg: '<svg width="30" height="30"><g fill="#bbb">\
	<rect height="4" width="4" y="17.5" x="7.5"/>\
	<rect height="4" width="4" y="17.5" x="18.5"/>\
	<rect height="4" width="4" y="17.5" x="13"/>\
	<rect height="4" width="4" y="13" x="7.5"/>\
	<rect height="4" width="4" y="13" x="18.5"/>\
	<rect height="4" width="4" y="13" x="13"/>\
	<rect height="4" width="4" y="8.5" x="7.5"/>\
	<rect height="4" width="4" y="8.5" x="18.5"/>\
	<rect height="4" width="4" y="8.5" x="13"/></g></svg>',

	large_view_icon_svg: '<svg width="30" height="30"><g fill="#bbb">\
	<rect height="4" width="4" y="17.5" x="7.5"/>\
	<rect height="4" width="4" y="17.5" x="18.5"/>\
	<rect height="4" width="4" y="17.5" x="13"/>\
	<rect height="8" width="15" y="8.5" x="7.374"/></g></svg>',

	pause_icon_svg: '<svg width="30" height="30"><g fill="#bbb">\
	<rect height="15" width="4" y="7.5" x="10"/>\
	<rect height="15" width="4" y="7.5" x="16"/>\
	</g></svg>'
};

var MediaType = {
	video: 0, gif: 1, static: 2, all: 3
}

var MediaFile = function(src, preview) {
	this.src = src;
	this.preview = preview;
	var ext = this.src.match(/\.[^.]+$/);
	if (!ext)
		throw new Error("The URL doesn't have the extension");
	if (ext[0] === ".webm" || ext[0] === ".mp4")
		this.type = MediaType.video;
	else if (ext[0] === ".gif")
		this.type = MediaType.gif;
	else
		this.type = MediaType.static;

	this.valid = function() {
		return this.src && this.preview;
	}
}

var create_element = function(tag, props) {
	if (!tag) throw new TypeError("Tag name is undefined");
	var res = document.createElement(tag);
	if (props) {
		var keys = Object.keys(props);
		for (var i in keys)
			res[keys[i]] = props[keys[i]];
	}
	return res;
}

var Gallery = {
	files: [],
	curr_seq: [],
	mode: {prevs_only: 0, large_view: 1},
	current_index: -1,
	is_visible: false,
	is_loaded: false,
	pause_on_close: true,
	preload_img: new Image(),

	init: function() {
		var self = this;

		var styles = create_element('style', {
			innerHTML: GalleryResources.css
		});
		document.head.appendChild(styles);

		this.main_wrap = create_element('div', {
			id: 'gallery-wrapper',
			innerHTML: GalleryResources.inner_html
		});
		this.main_wrap.style.display = 'none';

		this.ctrl_btn = create_element('div', {
			id: 'gallery-ctrl-btn',
			className: 'header-button',
			innerHTML: GalleryResources.ctrl_btn_svg
		});
		this.ctrl_btn.addEventListener('click', function() {
			self.toggle();
		}, 'false');

		document.body.appendChild(this.main_wrap);
		document.body.appendChild(this.ctrl_btn);

		var button1 = create_element('div', {
			id: "prevs-only-mode",
			className: 'header-button',
			innerHTML: GalleryResources.prevs_only_icon_svg
		});
		button1.addEventListener('click', function() {
			self.toggleMode(self.mode.prevs_only);
		});

		var button2 = create_element('div', {
			id: "large-view-mode",
			className: 'header-button checked',
			innerHTML: GalleryResources.large_view_icon_svg
		});
		button2.addEventListener('click', function() {
			self.toggleMode(self.mode.large_view);
		});

		var button3 = create_element('div', {
			id: "pause-on-close",
			className: 'header-button checked',
			title: "Pause the player on close?",
			innerHTML: GalleryResources.pause_icon_svg
		});
		button3.addEventListener('click', function() {
			if (self.pause_on_close) {
				self.pause_on_close = false;
				this.classList.remove('checked');
			}
			else {
				self.pause_on_close = true;
				this.classList.add('checked');
			}
		});

		var wrap1 = create_element('div', {
			className: "header-element"
		});
		var content_select = create_element("select", {
			innerHTML: GalleryResources.mode_select_inner_html
		});
		content_select.addEventListener("change", function() {
			self.showByType(this.selectedIndex);
		});
		wrap1.appendChild(content_select);

		var header = document.getElementById("gallery-header");
		header.appendChild(button1);
		header.appendChild(button2);
		header.appendChild(button3);
		header.appendChild(wrap1);

		this.player = document.querySelector("#gallery-player");
		this.canvas = document.querySelector("#gallery-main");
		this.footer = document.querySelector("#gallery-footer");
		this.preload_icon = document.querySelector("#gallery-ctrl-btn svg");
		this.player.volume = 0.1;
	},

	toggle: function() {
		if (!this.is_loaded) {
			this.load();
			this.is_loaded = true;
			this._previewSeq(this.files);
		}

		if (this.is_visible) {
			if (this.pause_on_close)
				this.player.pause();
			this.ctrl_btn.classList.toggle('checked');
			this.main_wrap.style.display = 'none';
			this.is_visible = false;
		}
		else {
			this.ctrl_btn.classList.toggle('checked');
			this.main_wrap.style.display = 'flex';
			this.is_visible = true;
		}
	},

	toggleMode: function(mode) {
		var m = document.querySelector('#gallery-main');
		var f = document.querySelector('#gallery-footer');

		switch(mode) {
			case this.mode.prevs_only:
				f.classList.remove('bottom');
				m.style.display = 'none';
				document.querySelector("#prevs-only-mode").
					classList.add("checked");
				document.querySelector("#large-view-mode").
					classList.remove("checked");
				break;
			case this.mode.large_view:
				f.classList.add('bottom');
				m.style.display = 'flex';
				document.querySelector("#large-view-mode").
					classList.add("checked");
				document.querySelector("#prevs-only-mode").
					classList.remove("checked");
				break;
		}
	},

	load: function() {
		var self = this;
		if (document.location.href.match(/https?:\/\/dobro/))
			var thumbs = document.querySelectorAll('.thumb');
		else if (document.location.href.match(/https?:\/\/boards.4ch/))
			var thumbs = document.querySelectorAll('.fileThumb img');
		else
			var thumbs = document.querySelectorAll('.post__file-preview');

		for (var i = 0, len = thumbs.length; i != len; ++i) {
			var mf = new MediaFile(thumbs[i].parentNode.href, thumbs[i].src);
			if (!mf.valid()) continue;

			var exists = this.files.some(function(x) {
				return (x.src === mf.src);
			});
			if (!exists) this.files.push(mf);
		}

		document.addEventListener('keydown', function(e) {
			if (!self.is_visible || !self.is_loaded)
				return;

			var used_keys = {
				left_arrow: 37,
				right_arrow: 39,
				space: 32,
				key_q: 81,
				key_h: 72,
				key_l: 76
			}
			switch (e.keyCode) {
				case used_keys.key_h:
				case used_keys.left_arrow:
					self.showPrev();
					break;

				case used_keys.key_l:
				case used_keys.right_arrow:
					self.showNext();
					break;

				case used_keys.space:
					if (self.player.style.display == 'none')
						return;

					if (self.player.paused)
						self.player.play();
					else
						self.player.pause();
					break;

				case used_keys.key_q:
					self.toggle();
					break;

				default: return;
			}
			e.preventDefault();
		});
	},

	_previewSeq: function(seq) {
		if (seq.length === 0) return;

		this.footer.innerHTML = "";
		this.curr_seq = seq;
		for (var i = 0, len = seq.length; i < len; ++i)
			this.footer.appendChild(this._genPreviewDiv(seq[i], i));
		this.show(0);
	},

	_genPreviewDiv: function(media_file, index) {
		var self = this;
		var res = create_element('a', {
			className: "gallery-preview",
			id: "prev_" + index,
			href: media_file.src
		});
		res.style.backgroundImage = 'url("'+media_file.preview+'")';
		res.addEventListener("click", function(e) {
			self.show(parseInt(this.id.match(/\d+$/)[0]));
			e.preventDefault();
		});

		if (media_file.type != MediaType.static) {
			var type_label = create_element('div', {
				className: 'type-preview',
				innerHTML: ["video", "gif"][media_file.type]
			});
			res.appendChild(type_label);
		}
		return res;
	},

	show: function(id) {
		var self = this;
		if (id >= this.curr_seq.length)
			id = 0;
		else if (id < 0)
			id = this.curr_seq.length - 1;

		this.current_index = id;
		this.toggleMode(this.mode.large_view);

		this.canvas.style.backgroundImage = 'none';
		this.player.pause();

		var media_file = this.curr_seq[id];

		if (media_file.type === MediaType.video) {
			this.preload_icon.classList.remove('anim-preload');
			this.player.style.display = 'block';
			this.player.src = media_file.src;
			this.player.play();
		}
		else {
			this.preload_icon.classList.add('anim-preload');
			this.player.style.display = 'none';

			this.preload_img.onload = function() {
				self.preload_icon.classList.remove('anim-preload');
				self.canvas.style.backgroundImage =
					'url("' + this.src + '")';
			}
			this.preload_img.src = media_file.src;
		}

		var preview_width = 100; // px
		this.footer.scrollLeft = preview_width * id -
			document.body.clientWidth / 2 + preview_width / 2;
	},

	showNext: function() {
		this.show(this.current_index + 1);
	},

	showPrev: function() {
		this.show(this.current_index - 1);
	},

	showByType: function(type) {
		if (type === MediaType.all) {
			this._previewSeq(this.files);
			return;
		}
		var new_seq = this.files.filter(function(x) {
			if (x.type === type) return x;
		});
		this._previewSeq(new_seq);
	}
};


window.addEventListener("DOMContentLoaded", Gallery.init(), "false");
// vim:ts=4:sw=4:

