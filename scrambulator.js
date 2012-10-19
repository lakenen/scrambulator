(function () {
	function findWords(str, modifiers) {
		str = str.toLowerCase();
		var out = [];
		var word, pts;
		for (var i = 0, len = WORDS.length; i < len; ++i) {
			word = WORDS[i];
			if (word.match(/(q[^u]|q$)/ig)) continue; // ignore non-qu q words
			var path = isWordInTable(word.replace('qu','q'), str);
			if (path !== false) {
				out.push({word:word.toUpperCase(), path:path, points:getpoints(word, path, modifiers)});
			}
		}
		out.sort(function(a,b) { return b.points - a.points || (a.word.toUpperCase() < b.word.toUpperCase() ? -1 : 1); });
		var ret = [[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
		$.each(out, function (i,o) {
			if (ret[o.word.length-2]) {
				ret[o.word.length-2].push(o);
			} else {
				ret[o.word.length-2] = [o];
			}
		});
		return ret;
	}

	function getpoints(letters, path, modifiers) {
		var total = 0, pts, word_mod = 1;
		for (var i = 0, l = letters.length; i < l; ++i) {
			pts = POINTS[letters[i]];
			switch (modifiers[path[i]]) {
				case 'tw':
					word_mod *= 3;
					break;
				case 'dw':
					word_mod *= 2;
					break;
				case 'tl':
					pts *= 3;
					break;
				case 'dl':
					pts *= 2;
					break;
			}
			total += pts;
		}
		if (letters.length == 2) {
			//total = 1;
		}
		total *= word_mod;
		switch (letters.length) {
			case 2:
				//total = 1;
				break;
			case 3:
			case 4:
				break;
			case 5:
				total += 3;
				break;
			case 6:
				total += 6;
				break;
			case 7:
				total += 10;
				break;
			case 8:
				total += 15;
				break;
			case 9:
				total += 20;
				break;
			default:
				total += (letters.length - 5) *5; // idk actually
				break
		}
		return total;
	}

	function isWordInTable(word, table) {
		word = word.toLowerCase();
		var found = false;
		var startingPositions;
		startingPositions = positionsInTable(word[0], table);
		if (startingPositions.length > 0) {
			for (var sp = 0; sp < startingPositions.length; sp++) {
				if (found) break;
				traverse(word.substr(1), startingPositions[sp], []);
			}
		}

		function traverse(str, pos, visited) {
			if (found) return;
			var next;
			visited.push(pos);
			if (str.length > 0) {
				next = NEXT[pos];
				for (var p = 0; p < next.length; p++) {
					if (visited.indexOf(next[p]) > -1) continue;
					if (table[next[p]] == str[0]) {
						traverse(str.substr(1), next[p], visited.slice(0));
					}
				}
			} else {
				found = visited;
			}
		}

		return found;
	}



	function positionsInTable(letter, table) {
		var out = [];
		for (var i = 0; i < table.length; i++) {
			if (table[i] === letter) {
				out.push(i);
			}
		}
		return out;
	}

	var NEXT = [
		[1, 4, 5], [0, 2, 4, 5, 6], [1, 3, 5, 6, 7], [2, 6, 7],
		[0, 1, 5, 8, 9], [0, 1, 2, 4, 6, 8, 9, 10], [1, 2, 3, 5, 7, 9, 10, 11], [2, 3, 6, 10, 11],
		[4, 5, 9, 12, 13], [4, 5, 6, 8, 10, 12, 13, 14], [5, 6, 7, 9, 11, 13, 14, 15], [6, 7, 10, 14, 15],
		[8, 9, 13], [8, 9, 10, 12, 14], [9, 10, 11, 13, 15], [10, 11, 14]
	];

	var POINTS = {
		a: 1,
		b: 4,
		c: 4,
		d: 2,
		e: 1,
		f: 4,
		g: 3,
		h: 3,
		i: 1,
		j: 10,
		k: 5,
		l: 2,
		m: 4,
		n: 2,
		o: 1,
		p: 4,
		q: 10,
		r: 1,
		s: 1,
		t: 1,
		u: 2,
		v: 5,
		w: 4,
		x: 8,
		y: 3,
		z: 10
	};

	function isCanvasSupported(){
	  var elem = document.createElement('canvas');
	  return !!(elem.getContext && elem.getContext('2d'));
	}
	/*function start() {
		if (!isCanvasSupported()) {
			$('#nocanvas').show();
			$('#input').hide();
			$('.loading').hide();
			return;
		}
		loadAssets(function () {
			$('button').removeAttr('disabled');
			$('.loading').hide();
			$('#input').show();
			init();
		});
	}*/

	$(function () {
		if (!isCanvasSupported()) {
			$('#nocanvas').show();
			$('#input').hide();
			$('.loading').hide();
			return;
		}
		$.ajax({
			crossDomain: true,
			url:'enable.txt',
			success: function (response) {
				WORDS = response.split(/\s+/);
				loadAssets(function () {
					$('button').removeAttr('disabled');
					$('.loading').hide();
					$('#input').show();
					init();
				});
			}
		});

	});
	function padString(str, pad, length) {
		while (str.length < length)
			str = str + pad;
		return str;
	}
	var MOD;
	function init() {
		$('#board').html(makeBoard());
		$('#form').submit(function() {
			$('#info').fadeOut('fast');
			var letters = $('#letters').val();
			location.hash = letters;
			var modifiers = letters.split(/./);
			$('#out').html('');
			var result = findWords(letters,modifiers);
			var total = 0;
			$.each(result, function (i,list) {
				if (list.length === 0) return;
				total+=list.length;
				var row = $('<div class="row">');
				row.append('<div>WORDS WITH '+(i+2)+' LETTERS</div>');
				$('#out').prepend(row);
				$.each(list, function (j, w) {
					if (w.path.length != w.word.replace('QU','Q').length) {
						console.log(w);
					}
					var div = $('<div class="solution">').append(w.word+' '+w.points).append('<br>').append(makeBoardPath(w.path, letters));
					row.append(div);
				});
				row.append('<div style="clear: both">');
			});
			$('#total').html(total+' words found');
			return false;
		});
		$('input').keyup(function(e) {
			if ((e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 97 && e.keyCode <= 122)) {
				$(this).val($(this).val().toUpperCase());
			}
			if ($(this).val().length > 16) {
				$(this).val($(this).val().substr(0,16));
			}
			$('#board').html(makeBoard($(this).val(), MOD));
		});
		if (location.hash.length == 17) {
			$('input').val(location.hash.substr(1)).keyup();
			$('#form').submit();
		}
	}

	var assets = {};
	var SIZE = 24;
	function loadAssets(cb) {
		var tile_names = ['tile', 'tile-selected', 'tile-selected-first', 'tile-dl', 'tile-dw', 'tile-tl', 'tile-tw'];
		var tiles = new Image();
		tiles.onload = function () {
			$.each(tile_names, function (i, name) {
				assets[name] = getTileAsCanvas(name);
			});
			cb();
		};
		tiles.src = 'tiles.png';


		function getTileAsCanvas(name) {
			var canvas = document.createElement('canvas');
			var tile_size = (tiles.width / tile_names.length);
			canvas.width = canvas.height = tile_size;
			var sx = tile_names.indexOf(name) * tile_size;
			canvas.getContext('2d').drawImage(tiles, sx, 0, tile_size, tile_size, 0, 0, tile_size, tile_size);
			return canvas;
		}
	}

	function makeBoard(letters, modifiers, size) {
		size = size || SIZE;
		letters = letters || '';
		letters = padString(letters,' ',16);
		var canvas = $('<canvas>').get(0);
		canvas.width = canvas.height = size*4;
		var ctx = canvas.getContext('2d');
		ctx.font = "bold 9pt Arial";
		ctx.textBaseline = 'top';
		var rows = letters.match(/.{4}/g);
		if (!rows) {
			rows = [];
		}
		rows.push(letters.substr(rows.length*4));
		var n = 0;
		$.each(rows, function (r, row) {
			var cols = row.split('');
			$.each(cols, function (c, letter) {
				drawTile(ctx, r, c, letter, false, false, modifiers&&modifiers[n++], size);
			});
		});

		return canvas;
	}

	function makeBoardPath(path, letters, size) {
		size = size || SIZE;
		var canvas = $('<canvas>').get(0);
		canvas.width = canvas.height = size*4;
		var ctx = canvas.getContext('2d');
		ctx.drawImage($('#board canvas').get(0), 0, 0, size*4, size*4);

		ctx.strokeStyle = '#ffcc00';
		ctx.lineWidth = 3;
		ctx.save();
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 1;
		ctx.shadowBlur    = 1;
		ctx.shadowColor   = 'rgba(0, 0, 0, 0.8)';
		var rowprev = Math.floor(path[path.length-1]/4);
		var colprev = path[path.length-1]%4;
		for (var p = path.length-2; p >= 0; p--) {
			var row = Math.floor(path[p]/4);
			var col = path[p]%4;
			ctx.beginPath();
			ctx.moveTo(colprev * size + size / 2, rowprev * size + size / 2);
			ctx.lineTo(col * size + size / 2, row * size + size / 2);
			ctx.closePath();
			ctx.stroke();
			rowprev = row;
			colprev = col;
		}
		ctx.restore();
		for (var p = 0; p < path.length; p++) {
			var row = Math.floor(path[p]/4);
			var col = path[p]%4;
			var letter = letters[path[p]];
			drawTile(ctx, row, col, letter, true, p===0);
		}

		return canvas;
	}

	function drawTile(ctx, row, col, letter, selected, first, modifier, size) {
		size = size || SIZE;
		var img;
		var points = POINTS[letter.toLowerCase()];
		if (letter == 'Q') letter = 'Qu';
		ctx.save();
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 1;
		ctx.shadowBlur    = 1;
		ctx.shadowColor   = 'rgba(0, 0, 0, 0.6)';
		if (selected) {
			if (first) {
				img = assets['tile-selected-first'];
			} else {
				img = assets['tile-selected'];
			}
			ctx.drawImage(img, col*size+2, row*size+2, size-4, size-4);
		} else {
			if (modifier) {
				img = assets['tile-'+modifier];
			} else {
				img = assets['tile'];
			}
			ctx.drawImage(img, col*size+3, row*size+3, size-6, size-6);
		}
		ctx.restore();
		ctx.textBaseline = 'top';
		if (selected) {
			if (first) {
				ctx.fillStyle = 'black';
			} else {
				ctx.fillStyle = '#581910';
			}
			ctx.font = "bold "+(size-10)+"px Arial";
		} else {
			ctx.fillStyle = 'black';
			ctx.font = "bold "+(size-14)+"px Arial";
		}
		ctx.save();
		if (modifier) {
		}
		ctx.fillText(letter, col*size+(size-ctx.measureText(letter).width)/2, row*size+(size-(selected?14:10))/2, size);
		ctx.restore();
		/*ctx.save();
		ctx.font="bold 5pt Arial";
		ctx.fillText(points, col*size+size - (ctx.measureText(points).width+3), row*size+3);
		ctx.restore();*/
	}

})();
