var ID_SOUNDS_FOLDER = "GrabacionesPastillas";
var ID_VOICE_URI_1 = "voice_1.amr";
var ID_VOICE_URI_2 = "voice_2.amr";
var ID_VOICE_URI_3 = "voice_3.amr";
var ID_VOICE_URI_4 = "voice_4.amr";
var ID_VOICE_URI_5 = "voice_5.amr";
var ID_VOICE_URI_6 = "voice_6.amr";

var ID_STATUS_ACTIVE = 500;
var ID_STATUS_NOT_ACTIVE = 501;

var ID_NOTIFY_NORMAL = 0;
var ID_NOTIFY_MUTE = 1;

var TOTAL_PILLS = 6;
var TOTAL_COLORS = 8;

var rad90 = -90 * (Math.PI / 180);

var loop = 0;
var vNoVoiceRecords = true;

var vBillsSelector = new Array(1, 1, 1, 1, 1, 1);
var vColors = new Array("#07f93a", "#077ef9", "#c907f9", "#f92307", "#d4f828",
		"#ffffff");
var colorId = new Array("green", "blue", "viola", "red", "yellow", "white");
var vVoices = new Array("beep", "beep", "beep", "beep", "beep", "beep");
var vVoicesUrl = new Array("none", "none", "none", "none", "none", "none");
var vStatus = new Array(504, 504, 504, 504, 504, 504);
var vIsRunning = new Array(0, 0, 0, 0, 0, 0);
var vTimeTotals = new Array(0, 0, 0, 0, 0, 0);

var arrayColors = new Array("#07f93a", "#077ef9", "#c907f9", "#f92307",
		"#d4f828", "#ffffff", "#fa68da", "#8ff3ff");
var colorsArrayId = new Array("green", "blue", "viola", "red", "yellow",
		"white", "pink", "sky");

var audio1;
var audio2;
var audio3;
var audio4;
var audio5;
var audio6;
var audioBeep = null;

var vCurrentReminder = -1;
var vCurrentPage = 0;

var camera = null;
var audioPath;
var audioStartTime;
var audioLengthCheckInterval;
var MAX_RECORDING_TIME = 4000;
var MAX_RECORDING_SEC = 4;
var REMIAN_RECORDING_SEC = 0;
var vRecordedFile;
var recordImg;

var vIsAlarmTime = false;
var vNextAlarmId = -1;
var vNextReminder = -1;
var oneSecond = 1000;

var ID_PAGE_NEXT = 100;
var ID_PAGE_ALL = 200;
var ID_PAGE_REMINDER_ON = 300;
var ID_PAGE_QUICK = 400;
var ID_PAGE_COLORS = 500;
var ID_PAGE_REMINDER_1 = 1;
var ID_PAGE_REMINDER_2 = 2;
var ID_PAGE_REMINDER_3 = 3;
var ID_PAGE_REMINDER_4 = 4;
var ID_PAGE_REMINDER_5 = 5;
var ID_PAGE_REMINDER_6 = 6;

$(window).load(function() {
	document.addEventListener('tizenhwkey', function(e) {
		if (e.keyName == "back")
			tizen.application.getCurrentApplication().exit();
	});

	InitPref();
	loadColors();
	checkAlarm();
	GetVoices();

	audio1 = document.getElementById("audio1");
	audio2 = document.getElementById("audio2");
	audio3 = document.getElementById("audio3");
	audio4 = document.getElementById("audio4");
	audio5 = document.getElementById("audio5");
	audio6 = document.getElementById("audio6");
	audioBeep = document.getElementById("beepAudio");

	recordImg = new Image();
	recordImg.src = 'images/icon_record.png';
});

$(function() {

	$(".c_RecordBtn").on("click", function(e) {
		$.mobile.changePage("#page_record");
	});

	$(".c_SetBtn").on("click", function(e) {
		setReminderBtn();
	});

	$(".c_StopBtn").on("click", function(e) {
		stopReminderBtn();
	});

	$(".c_MuteBtn").on("click", function(e) {
		muteReminderBtn();
	});

	$(".c_voice").on("click", function(e) {

		var id = e.target.id;
		var num = id.substr(13, 14);
		// console.log("num = " + num);
		playSoundNoVibrate(num);
	});

	$("#id_quick_set").on("click", function(e) {
		quickSet();
		$('#id_quick_set').removeClass('ui-btn-active');
	});

	$("#id_select_dosages").bind("change", function(event, ui) {
		localStorage.setItem('QUICK_NUMBERS', $("#id_select_dosages").val());
	});

	$("#id_select_preiod").bind("change", function(event, ui) {
		localStorage.setItem('QUICK_HOURS', $("#id_select_preiod").val());
	});

	$(".selectBillsType").bind("change", function(event, ui) {
		var id = vCurrentReminder + 1;
		var strName = "#id_select_reminder_bills" + id;
		localStorage.setItem('REMINDER_BILLS_' + id, $(strName).val());
		vBillsSelector[vCurrentReminder] = $(strName).val();
	});

	$("#id_alarm_end").on("click", function(e) {
		navigator.vibrate(0);
		endAlarm();

	});

	$("#id_alarm_close").on("click", function(e) {
		navigator.vibrate(0);
		$.mobile.changePage("#page_all");
	});

	$("#id_alarm_snooze").on("click", function(e) {
		navigator.vibrate(0);
		snoozeAlarm(vNextAlarmId);

	});

	$("#id_next_voice_btn").on("click", function(e) {
		$('#id_next_voice_btn').removeClass('ui-btn-active');
		if (vNextReminder == -1) {
			alert("Sin notas de voz!!");
		} else {
			playSoundNoVibrate(vNextReminder + 1);

		}
	});

	$("#id_select_pill").bind("change", function() {
		var id = $("#id_select_pill").val();
		var colorId = localStorage.getItem("COLOR_ID_" + id);
		$('#id_select_color').val(colorId).selectmenu('refresh');
	});

	$("#id_select_color").bind("change", function() {
		switchColor();

	});

	$(".c_Switch").on("click", function(e) {
		switchPill(e.target.id);
	});

});

function switchPill(id) {

	var num = id.substr(14, 15);

	for ( var n = 1; n <= TOTAL_PILLS; n++) {
		$('#id_section_' + n).hide();
		$('#id_btn_switch_' + n).removeClass('ui-btn-active');
		$('#id_btn_switch_' + n).blur();
	}

	$('#id_section_' + num).show();
	// $('#id_btn_switch_'+n).addClass('ui-btn-active');
}

$(document).on('change', '.c_reminderInput', function() {
	var id = vCurrentReminder + 1;
	var tag = "#id_reminder_input_" + id;
	var value = $(tag).val();
	localStorage.setItem('REMINDER_TIME_' + id, value);
});

$(document).on("pageinit", "#page1", function(event) {
	loadColors();
});

$(document).on("pagebeforeshow", "#page1", function(event) {
	vCurrentTimer = -1;
	vCurrentPage = ID_PAGE_NEXT;
	findNext();
});

$(document).on("pagebeforeshow", "#page_all", function(event) {
	vCurrentTimer = -1;
	vCurrentPage = ID_PAGE_ALL;
	LoadAlarmsData();
	if (audioBeep != "undefined") {
		if (!audioBeep.paused)
			audioBeep.pause();
	}

});

$(document).on("pagebeforeshow", "#page_colors", function(event) {
	vCurrentTimer = -1;
	vCurrentPage = ID_PAGE_COLORS;

	var colorId = localStorage.getItem("COLOR_ID_1");
	$('#id_select_pill').val(1).selectmenu('refresh');
	$('#id_select_color').val(colorId).selectmenu('refresh');

});

$(document).on("pagebeforeshow", "#page_reminder1", function(event) {
	vCurrentReminder = 0;
	vCurrentPage = ID_PAGE_REMINDER_1;
	LoadSavedData();

});

$(document).on("pagebeforeshow", "#page_reminder2", function(event) {
	vCurrentReminder = 1;
	vCurrentPage = ID_PAGE_REMINDER_2;
	LoadSavedData();

});

$(document).on("pagebeforeshow", "#page_reminder3", function(event) {
	vCurrentReminder = 2;
	vCurrentPage = ID_PAGE_REMINDER_3;
	LoadSavedData();

});

$(document).on("pagebeforeshow", "#page_reminder4", function(event) {
	vCurrentReminder = 3;
	vCurrentPage = ID_PAGE_REMINDER_4;
	LoadSavedData();

});

$(document).on("pagebeforeshow", "#page_reminder5", function(event) {
	vCurrentReminder = 4;
	vCurrentPage = ID_PAGE_REMINDER_5;
	LoadSavedData();

});

$(document).on("pagebeforeshow", "#page_reminder6", function(event) {
	vCurrentReminder = 5;
	vCurrentPage = ID_PAGE_REMINDER_6;
	LoadSavedData();

});

$(document).on("pagebeforeshow", "#page_quick", function(event) {
	vCurrentPage = ID_PAGE_QUICK;
	LoadQuickData();

});

$(document).on(
		"pagebeforeshow",
		"#page_reminder_on",
		function(event) {
			var reminder = vNextAlarmId - 1;
			$('#id_cuurent_time').text(
					localStorage.getItem("REMINDER_TIME_" + vNextAlarmId));
			var iconStatus = "images/icon_bill_" + colorId[reminder] + "_"
					+ localStorage.getItem("REMINDER_BILLS_" + vNextAlarmId)
					+ ".png";
			$("#id_current_status").attr("src", iconStatus);
			vCurrentPage = ID_PAGE_REMINDER_ON;
			playReminderSound(vNextAlarmId);
			vibrate();
			tizen.power.turnScreenOn();

		});

$(document).on("pageshow", "#page_record", function(event) {
	recordAudio();
	drawRecordTime();
});

$(document).on('swiperight', '#page1', function() {
	$.mobile.changePage("#page_all");
});

$(document).on('swipeleft', '#page1', function() {
	$.mobile.changePage("#page_reminder1");
});

$(document).on('swiperight', '#page_all', function() {
	$.mobile.changePage("#page_quick");
});

$(document).on('swipeleft', '#page_all', function() {
	$.mobile.changePage("#page1");
});

$(document).on('swiperight', '#page_reminder1', function() {
	$.mobile.changePage("#page1");
});

$(document).on('swipeleft', '#page_reminder1', function() {
	$.mobile.changePage("#page_reminder2");
});

$(document).on('swiperight', '#page_reminder2', function() {
	$.mobile.changePage("#page_reminder1");
});

$(document).on('swipeleft', '#page_reminder2', function() {
	$.mobile.changePage("#page_reminder3");
});

$(document).on('swiperight', '#page_reminder3', function() {
	$.mobile.changePage("#page_reminder2");
});

$(document).on('swipeleft', '#page_reminder3', function() {
	$.mobile.changePage("#page_reminder4");
});

$(document).on('swiperight', '#page_reminder4', function() {
	$.mobile.changePage("#page_reminder3");
});

$(document).on('swipeleft', '#page_reminder4', function() {
	$.mobile.changePage("#page_reminder5");
});

$(document).on('swiperight', '#page_reminder5', function() {
	$.mobile.changePage("#page_reminder4");
});

$(document).on('swipeleft', '#page_reminder5', function() {
	$.mobile.changePage("#page_reminder6");
});

$(document).on('swiperight', '#page_reminder6', function() {
	$.mobile.changePage("#page_reminder5");
});

$(document).on('swipeleft', '#page_reminder6', function() {
	$.mobile.changePage("#page_colors");
});

$(document).on('swiperight', '#page_quick', function() {
	$.mobile.changePage("#page_colors");
});

$(document).on('swipeleft', '#page_quick', function() {
	$.mobile.changePage("#page_all");
});

$(document).on('swiperight', '#page_colors', function() {
	$.mobile.changePage("#page_reminder6");
});

$(document).on('swipeleft', '#page_colors', function() {
	$.mobile.changePage("#page_quick");
});

function switchColor() {
	var id = $("#id_select_pill").val();
	var color = $("#id_select_color").val();
	var colorHex;

	for ( var n = 0; n < TOTAL_COLORS; n++) {
		if (colorsArrayId[n] == color) {
			colorHex = arrayColors[n];
			localStorage.setItem("COLOR_HEX_" + id, colorHex);
		}
	}

	vColors[id - 1] = colorHex;
	colorId[id - 1] = color;
	localStorage.setItem("COLOR_ID_" + id, color);
	loadColors();
}

function setReminderBtn() {
	var id = vCurrentReminder + 1;
	var navbar1 = '#id_remind' + id + '_navbar1';
	var navbar2 = '#id_remind' + id + '_navbar2';
	var setDiv = "#id_reminder_set" + id;
	var runDiv = "#id_remind_run" + id;
	var setBtn = '#id_remind_set' + id;
	var timeStatus = "#id_count_" + id;
	var status = '#id_med_status_' + id;
	var reminderStatus = "#id_reminder_status_" + id;
	var reminderTime = "#id_reminder_active_" + id;
	var iconStatus = "images/icon_bill_" + colorId[vCurrentReminder] + "_"
			+ vBillsSelector[vCurrentReminder] + ".png";

	$(setDiv).hide();
	$(runDiv).show();

	$(navbar1).hide();
	$(navbar2).show();
	$(setBtn).removeClass('ui-btn-active');
	$(setBtn).blur();
	$(status).attr("src", iconStatus);
	$(reminderStatus).attr("src", iconStatus);
	$(reminderTime).text(localStorage.getItem('REMINDER_TIME_' + id));
	$(timeStatus).text(localStorage.getItem('REMINDER_TIME_' + id));
	vStatus[vCurrentReminder] = ID_STATUS_ACTIVE;
	setAlarm();
}

function stopReminderBtn() {

	var id = vCurrentReminder + 1;
	var navbar1 = '#id_remind' + id + '_navbar1';
	var navbar2 = '#id_remind' + id + '_navbar2';
	var setDiv = "#id_reminder_set" + id;
	var runDiv = "#id_remind_run" + id;
	var stopBtn = '#id_remind_stop' + id;
	var timeStatus = "#id_count_" + id;
	var status = '#id_med_status_' + id;

	var iconStatus = "images/icon_bill_" + colorId[vCurrentReminder] + "_0"
			+ ".png";

	$(setDiv).show();
	$(runDiv).hide();

	$(navbar1).show();
	$(navbar2).hide();
	$(stopBtn).removeClass('ui-btn-active');
	$(stopBtn).blur();
	$(status).attr("src", iconStatus);
	$(timeStatus).text("--:--");
	vStatus[vCurrentReminder] = ID_STATUS_NOT_ACTIVE;
	localStorage.setItem("REMINDER_NOTIFY_" + id, ID_NOTIFY_NORMAL);
	removeAlarm(id);
}

function muteReminderBtn() {

	var id = vCurrentReminder + 1;
	var muteBtn = "#id_remind_mute" + id;
	var muteStatus = localStorage.getItem("REMINDER_NOTIFY_" + id);

	if (muteStatus == ID_NOTIFY_MUTE) {
		localStorage.setItem("REMINDER_NOTIFY_" + id, ID_NOTIFY_MUTE);
		$(muteBtn).addClass('ui-btn-active');
	} else {
		localStorage.setItem("REMINDER_NOTIFY_" + id, ID_NOTIFY_NORMAL);
		$(muteBtn).removeClass('ui-btn-active');
		$(muteBtn).blur();
	}

}

function GetTimeStr(alarmTime) {

	var hours = Math.floor(alarmTime / 60);
	var hoursStr = (hours < 10) ? "0" + hours : hours;

	var mins = alarmTime - (hours * 60);
	var minsStr = (mins < 10) ? "0" + mins : mins;
	var timeStr = hoursStr + ":" + minsStr;
	return timeStr;

}

function LoadSavedData() {
	var id = vCurrentReminder + 1;
	var setDiv = "#id_reminder_set" + id;
	var runDiv = "#id_remind_run" + id;
	var navbar1 = '#id_remind' + id + '_navbar1';
	var navbar2 = '#id_remind' + id + '_navbar2';
	var reminderStatus = "#id_reminder_status_" + id;
	var reminderTime = "#id_reminder_active_" + id;
	var iconStatus = "images/icon_bill_" + colorId[vCurrentReminder] + "_"
			+ vBillsSelector[vCurrentReminder] + ".png";

	var billStr = 'REMINDER_BILLS_' + id;
	var inputTime = '#id_reminder_input_' + id;
	var billSelect = '#id_select_reminder_bills' + id;

	$(inputTime).val(localStorage.getItem("REMINDER_TIME_" + id));
	var value = parseInt(localStorage.getItem(billStr));

	$(billSelect).val(value).selectmenu('refresh');
	vBillsSelector[vCurrentReminder] = value;

	$(reminderTime).text(localStorage.getItem("REMINDER_TIME_" + id));
	$(reminderStatus).attr("src", iconStatus);

	var reminderStatus = parseInt(localStorage.getItem("REMINDER_STATUS_" + id));
	if (reminderStatus == ID_STATUS_NOT_ACTIVE) {
		$(setDiv).show();
		$(runDiv).hide();
		$(navbar1).show();
		$(navbar2).hide();

	} else {
		$(setDiv).hide();
		$(runDiv).show();
		$(navbar2).show();
		$(navbar1).hide();

	}

	setMuteBtnState();
}

function setMuteBtnState() {

	var id = vCurrentReminder + 1;
	var muteBtn = "#id_remind_mute" + id;
	var muteStatus = localStorage.getItem("REMINDER_NOTIFY_" + id);

	if (muteStatus == ID_NOTIFY_MUTE) {
		$(muteBtn).addClass('ui-btn-active');
	} else {
		$(muteBtn).removeClass('ui-btn-active');
		$(muteBtn).blur();
	}
}

function LoadQuickData() {

	var quickNumbers = parseInt(localStorage.getItem("QUICK_NUMBERS"));
	var quickHours = parseInt(localStorage.getItem("QUICK_HOURS"));

}

function LoadAlarmsData() {

	// Do the math.
	var current = new Date();
	var millisecondsPerDay = 1000 * 60 * 60 * 24;
	var daysValue = 0;
	var millisBetween = 0;
	var daysDiff = 0;

	for ( var n = 0; n < TOTAL_PILLS; n++) {
		var id = n + 1;
		var status = "#id_med_status_" + id;
		var timer = "#id_count_" + id;
		var days = "#id_days_" + id;
		var statusValue = localStorage.getItem("REMINDER_STATUS_" + id);

		if (statusValue == ID_STATUS_ACTIVE) {
			var timerValue = localStorage.getItem("REMINDER_TIME_" + id);
			var billsValue = localStorage.getItem("REMINDER_BILLS_" + id);
			var iconStatus = "images/icon_bill_" + colorId[n] + "_"
					+ billsValue + ".png";

			daysValue = parseInt(localStorage.getItem("DAYS_ID_" + id));
			millisBetween = current.getTime() - daysValue;
			daysDiff = Math.floor(millisBetween / millisecondsPerDay);
			if (daysDiff < 0)
				daysDiff = 0;

			$(status).attr("src", iconStatus);
			$(days).text(daysDiff);
			$(timer).text(timerValue);

		} else {
			var iconStatusZero = "images/icon_bill_" + colorId[n] + "_0.png";
			$(status).attr("src", iconStatusZero);
			$(timer).text("--:--");
			$(days).text("0");
		}

	}

}

function playSoundNoVibrate(id) {

	if (id == 1) {
		if (vVoicesUrl[0] != "none") {
			audio1.src = vVoicesUrl[0];
			audio1.play();
		} else {
			alert("Sin notas de voz!!");
		}
	}

	if (id == 2) {
		if (vVoicesUrl[1] != "none") {
			audio2.src = vVoicesUrl[1];
			audio2.play();
		} else {
			alert("Sin notas de voz!!");
		}
	}

	if (id == 3) {
		if (vVoicesUrl[2] != "none") {
			audio3.src = vVoicesUrl[2];
			audio3.play();
		} else {
			alert("Sin notas de voz!!");
		}
	}

	if (id == 4) {
		if (vVoicesUrl[3] != "none") {
			audio4.src = vVoicesUrl[3];
			audio4.play();
		} else {
			alert("Sin notas de voz!!");
		}
	}

	if (id == 5) {
		if (vVoicesUrl[4] != "none") {
			audio5.src = vVoicesUrl[4];
			audio5.play();
		} else {
			alert("Sin notas de voz!!");
		}
	}

	if (id == 6) {
		if (vVoicesUrl[5] != "none") {
			audio6.src = vVoicesUrl[5];
			audio6.play();
		} else {
			alert("Sin notas de voz!!");
		}
	}

}

function vibrate() {
	navigator.vibrate([ 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000 ]);
}

function GetVoices() {

	// var path = "file:///opt/usr/media/Images/photo.jpg";
	if (loop < 2) {
		tizen.filesystem.resolve('file:///opt/usr/media/Sounds/GrabacionesPastillas',
				onResolveSuccess, onResolveError, 'r');
	}
}

function onResolveSuccess(dir) {
	dir.listFiles(onsuccess, onerror);
}

function onResolveError() {

	console.log('error resolve');
	tizen.filesystem.resolve('file:///opt/usr/media/Sounds/', onResolveCreate,
			onResolveCreateError, 'r');

}

function onResolveCreate(dir) {

	loop++;
	dir.createDirectory("GrabacionesPastillas");
	GetVoices();
}

function onsuccess(files) {

	if (files.length == 0) {
		for ( var n = 0; n < TOTAL_PILLS; n++)
			vVoicesUrl[n] = "none";
	} else {

		for ( var i = 0; i < files.length; i++) {
			var name = files[i].name;
			var uri = files[i].toURI();

			if (name == ID_VOICE_URI_1) {
				vVoicesUrl[0] = files[i].toURI();
			} else if (name == ID_VOICE_URI_2) {
				vVoicesUrl[1] = files[i].toURI();
			} else if (name == ID_VOICE_URI_3) {
				vVoicesUrl[2] = files[i].toURI();
			} else if (name == ID_VOICE_URI_4) {
				vVoicesUrl[3] = files[i].toURI();
			} else if (name == ID_VOICE_URI_5) {
				vVoicesUrl[4] = files[i].toURI();
			} else if (name == ID_VOICE_URI_6) {
				vVoicesUrl[5] = files[i].toURI();
			}

		}

	}

}

function onerror() {

	for ( var n = 0; n < TOTAL_PILLS; n++)
		vVoices[n] = "none";
}

function onResolveCreateError() {

	for ( var n = 0; n < TOTAL_PILLS; n++)
		vVoices[n] = "none";
}

function recordAudio() {
	var id = vCurrentReminder + 1;

	REMIAN_RECORDING_SEC = MAX_RECORDING_SEC;

	if (tizen.systeminfo.getCapabilities().platformVersion === "2.2.1") {
		alert("Please update your Gear to be able to record audio!")
	}

	navigator.webkitGetUserMedia({
		video : false,
		audio : true
	}, gotStream, noStream);
}

function gotStream(stream) {
	navigator.tizCamera.createCameraControl(stream, gotCamera, noCamera);
}

function noStream() {
	history.go(-1);
}

function gotCamera(cam) {

	var id = vCurrentReminder + 1;
	var settings = {}, fileName = '';

	camera = cam;
	vRecordedFile = "voice_" + id + ".amr";

	settings.fileName = vRecordedFile;
	settings.recordingFormat = "amr";
	camera.recorder.applySettings(settings, onSettingsApplied, function() {
		alert("Reinicia la aplicación para grabar sonido");
	});
}

function noCamera() {

	if (camera != null) {
		var id = vCurrentReminder + 1;
		var settings = {}, fileName = '';
		vRecordedFile = "voice_" + id + ".amr";

		settings.fileName = vRecordedFile;
		settings.recordingFormat = "amr";
		camera.recorder.applySettings(settings, onSettingsApplied, function() {
			alert("Reinicia la aplicación para grabar sonido");
		});
	}
}

function onSettingsApplied() {
	camera.recorder.start(onRecordStarted, function() {
		alert("Reinicia la aplicación para grabar sonido");
	});
}

function onRecordStarted() {
	$('#id_record_header').text("Grabando");
	startTracingAudioLength();

}

function startTracingAudioLength() {
	audioStartTime = new Date();
	audioLengthCheckInterval = window.setInterval(checkAudioLength, 1000);
}

function checkAudioLength() {
	var currentTime = new Date();
	REMIAN_RECORDING_SEC--;
	drawRecordTime();
	if (currentTime - audioStartTime > MAX_RECORDING_TIME) {
		window.clearInterval(audioLengthCheckInterval);
		stopRecording();
	}

}

function stopRecording() {
	camera.recorder.stop(onAudioRecordingStopSuccess, function() {
		alert("Reinicia la aplicación para grabar sonido");
	});
}

function onAudioRecordingStopSuccess() {
	var path = "file:///opt/usr/media/Sounds/";

	tizen.filesystem.resolve(path, MoveFileToAppFolder, function() {
		alert("Reinicia la aplicación para grabar sonido");
	});

}

function MoveFileToAppFolder(dir) {
	var dest = "file:///opt/usr/media/Sounds/GrabacionesPastillas/" + vRecordedFile;
	var source = "file:///opt/usr/media/Sounds/" + vRecordedFile;
	var msg = "Reinicia la aplicación para grabar sonido";
	dir.moveTo(source, dest, true, function() {
		closeRecordPage();
	}, function() {
		alert(msg);
	});
}

function closeRecordPage() {
	var recorded = "file:///opt/usr/media/Sounds/GrabacionesPastillas/"
			+ vRecordedFile;
	history.go(-1);

	GetVoices();

}

function drawRecordTime() {
	var canvasId = "recordCanvas";
	canvas = document.getElementById(canvasId);
	ctx = canvas.getContext('2d');
	ctx.lineWidth = 10;
	ctx.strokeStyle = "#f99107"
	ctx.clearRect(0, 0, 300, 300);
	ctx.save();
	ctx.drawImage(recordImg, 75, 40, 150, 150);
	ctx.rotate(rad90);
	ctx.beginPath();
	var endAngle = (Math.PI * REMIAN_RECORDING_SEC * 2 / MAX_RECORDING_SEC);

	ctx.arc(-120, 145, 110, 0, endAngle, false);
	ctx.stroke();
	ctx.restore();

}

function setAlarm() {
	var id = vCurrentReminder + 1;
	var current = new Date();
	var hour;
	var min;
	var alarmDate;
	var app = tizen.application.getCurrentApplication();
	var alarm;
	var alarmTime = localStorage.getItem('REMINDER_TIME_' + id);

	hour = parseInt(alarmTime.substr(0, 2));
	min = parseInt(alarmTime.substr(3));

	alarmDate = new Date(current.getFullYear(), current.getMonth(), current
			.getDate(), hour, min, 0, 0);

	var appControl = new tizen.ApplicationControl("GetWell" + id, null, null,
			null, null);
	alarm = new tizen.AlarmAbsolute(alarmDate, tizen.alarm.PERIOD_DAY);
	tizen.alarm.add(alarm, app.appInfo.id, appControl);
	localStorage.setItem('REMINDER_ID_' + id, alarm.id);
	localStorage.setItem("REMINDER_STATUS_" + id, ID_STATUS_ACTIVE);
	localStorage.setItem("DAYS_ID_" + id, alarmDate.getTime());
	var hourStr = (hour < 10) ? "0" + hour : hour;
	var minStr = (min < 10) ? "0" + min : min;

}

function snoozeAlarm(id) {
	var current = new Date();
	var app = tizen.application.getCurrentApplication();
	var appControl = new tizen.ApplicationControl("GetWell" + id, null, null,
			null, null);

	var alarmTime = localStorage.getItem('REMINDER_TIME_' + id);

	var hour = parseInt(alarmTime.substr(0, 2));
	var min = parseInt(alarmTime.substr(3));

	var alarmDate = new Date(current.getFullYear(), current.getMonth(), current
			.getDate(), hour, min, 0, 0);

	var snoozeTime = new Date(alarmDate.getTime() + 300000);

	var alarm = new tizen.AlarmAbsolute(snoozeTime);
	tizen.alarm.add(alarm, app.appInfo.id, appControl);
	localStorage.setItem('REMINDER_SNOOZE_ID_' + id, alarm.id);
	$.mobile.changePage("#page_all");
}

function removeAlarm(id) {
	var alarmId = localStorage.getItem('REMINDER_ID_' + id);
	tizen.alarm.remove(alarmId);
	var alarms = tizen.alarm.getAll();
	var snoozeId = parseInt(localStorage.getItem("REMINDER_SNOOZE_ID_" + id));
	// console.log("alarms = " + alarms.length);

	for ( var n = 0; n < alarms.length; n++) {
		if (snoozeId == alarms[n].id) {
			tizen.alarm.remove(snoozeId);
			localStorage.setItem("REMINDER_SNOOZE_ID_" + id, 0);
		}
	}

	localStorage.setItem("REMINDER_STATUS_" + id, ID_STATUS_NOT_ACTIVE);
	localStorage.setItem('REMINDER_ID_' + id, 0);
}

function endAlarm() {
	var id = vNextAlarmId;
	var alarmId = localStorage.getItem('REMINDER_ID_' + id);
	tizen.alarm.remove(alarmId);

	var alarms = tizen.alarm.getAll();
	var snoozeId = parseInt(localStorage.getItem("REMINDER_SNOOZE_ID_" + id));
	// console.log("alarms = " + alarms.length);

	for ( var n = 0; n < alarms.length; n++) {
		if (snoozeId == alarms[n].id) {
			tizen.alarm.remove(snoozeId);
			localStorage.setItem("REMINDER_SNOOZE_ID_" + id, 0);
		}
	}

	localStorage.setItem("REMINDER_STATUS_" + id, ID_STATUS_NOT_ACTIVE);
	localStorage.setItem('REMINDER_ID_' + id, 0);
	$.mobile.changePage("#page_all");
	alert("Felicidades esta alerta ha finalizado!")

}

function quickSet() {

	var number = parseInt(localStorage.getItem("QUICK_NUMBERS"));
	var hours = parseInt(localStorage.getItem("QUICK_HOURS"));

	console.log("numbers = " + number);

	if (number == 1) {
		quickReset();
		setQuickAlarm(number);
	} else if (number == 2) {
		quickReset();
		setQuickAlarm(number);
	} else if (number == 3) {
		if (hours > 8) {
			alert("No puedes elegir mas de 8 horas!!")
		} else {
			quickReset();
			setQuickAlarm(number);
		}
	} else if (number == 4) {
		if (hours > 6) {
			alert("No puedes elegir mas de 6 horas!!")
		} else {
			quickReset();
			setQuickAlarm(number);
		}
	} else if (number == 5) {
		if (hours > 5) {
			alert("No puedes elegir mas de 4 horas!!")
		} else {
			quickReset();
			setQuickAlarm(number);
		}
	} else if (number == 6) {
		if (hours > 4) {
			alert("No puedes elegir mas de 3 horas!!")
		} else {
			quickReset();
			setQuickAlarm(number);
		}
	}
}

function quickReset() {
	tizen.alarm.removeAll();
	for ( var n = 1; n < 7; n++) {
		localStorage.setItem('REMINDER_ID_' + n, 0);
		localStorage.setItem("REMINDER_STATUS_" + n, ID_STATUS_NOT_ACTIVE);
		localStorage.setItem("DAYS_ID_" + n, 0);
	}

}

function setQuickAlarm(n) {
	var hour;
	var min;
	var alarmDate;
	var app = tizen.application.getCurrentApplication();
	var alarm;
	var periodId = 0;
	var period = parseInt(localStorage.getItem("QUICK_HOURS")) * 60 * 60 * 1000;

	for ( var x = 1; x <= n; x++) {
		var periodTime = periodId * period;

		alarmDate = new Date();
		alarmPeriod = new Date(alarmDate.getTime() + periodTime);
		alarmReminderDate = new Date(alarmPeriod.getFullYear(), alarmPeriod.getMonth(), alarmPeriod
				.getDate(), alarmPeriod.getHours(), alarmPeriod.getMinutes(), 0, 0);
		alarm = new tizen.AlarmAbsolute(alarmReminderDate, tizen.alarm.PERIOD_DAY);
		var appControl = new tizen.ApplicationControl("GetWell" + x, null,
				null, null, null);
		tizen.alarm.add(alarm, app.appInfo.id, appControl);

		localStorage.setItem('REMINDER_ID_' + x, alarm.id);
		localStorage.setItem("REMINDER_STATUS_" + x, ID_STATUS_ACTIVE);
		localStorage.setItem("DAYS_ID_" + x, alarmDate.getTime());
		// console.log("time = ", alarmDate.getTime());

		var alarm_hours = alarmPeriod.getHours();
		var alarm_minutes = alarmPeriod.getMinutes();
		var hourStr = (alarm_hours < 10) ? "0" + alarm_hours : alarm_hours;
		var minStr = (alarm_minutes < 10) ? "0" + alarm_minutes : alarm_minutes;

		localStorage.setItem('REMINDER_TIME_' + x, hourStr + ":" + minStr);
		periodId++;

	}

	alert("Establecido correctamente!")

}

function ConvertStrToMinutes(timeStr) {

	if (timeStr != null) {

		var hourStr = timeStr.substr(0, 2);
		var minStr = timeStr.substr(3);

		var hhs = parseInt(hourStr);
		var mins = parseInt(minStr);

		return ((hhs * 60) + mins);
	} else {
		return 0;
	}

}

function findNext() {

	var active = new Array(-1, -1, -1, -1, -1);
	var diffs = new Array(-1, -1, -1, -1, -1);
	vNextReminder = -1;
	var currentTime = new Date();
	var hour = currentTime.getHours();
	var min = currentTime.getMinutes();
	var seconds = currentTime.getSeconds();

	var next = (hour * 60) + (min);

	var alarm1Pref = localStorage.getItem('REMINDER_STATUS_1');
	var alarm2Pref = localStorage.getItem('REMINDER_STATUS_2');
	var alarm3Pref = localStorage.getItem('REMINDER_STATUS_3');
	var alarm4Pref = localStorage.getItem('REMINDER_STATUS_4');
	var alarm5Pref = localStorage.getItem('REMINDER_STATUS_5');
	var alarm6Pref = localStorage.getItem('REMINDER_STATUS_6');

	var alarm1Time = localStorage.getItem('REMINDER_TIME_1');
	var alarm2Time = localStorage.getItem('REMINDER_TIME_2');
	var alarm3Time = localStorage.getItem('REMINDER_TIME_3');
	var alarm4Time = localStorage.getItem('REMINDER_TIME_4');
	var alarm3Time = localStorage.getItem('REMINDER_TIME_5');
	var alarm4Time = localStorage.getItem('REMINDER_TIME_6');

	if (alarm1Pref == null && alarm2Pref == null && alarm3Pref == null
			&& alarm4Pref == null && alarm5Pref == null && alarm6Pref == null) {

		var color = colorId[n];
		if (color == undefined) {
			color = "green";
		}
		$('#id_next_remain').text("--:--");
		$('#id_next_time').text("--:--");
		var imgSrc = "images/icon_bill_" + color + "_0.png";
		$('#id_next_pills').attr("src", imgSrc);

	} else if (alarm1Pref == ID_STATUS_NOT_ACTIVE
			&& alarm2Pref == ID_STATUS_NOT_ACTIVE
			&& alarm3Pref == ID_STATUS_NOT_ACTIVE
			&& alarm4Pref == ID_STATUS_NOT_ACTIVE
			&& alarm5Pref == ID_STATUS_NOT_ACTIVE
			&& alarm6Pref == ID_STATUS_NOT_ACTIVE) {
		$('#id_next_remain').text("--:--");
		$('#id_next_time').text("--:--");
		var imgSrc = "images/icon_bill_" + colorId[0] + "_0.png";
		$('#id_next_pills').attr("src", imgSrc);
		// console.log("xcolor id = " + colorId[n]);

	} else {
		if (alarm1Pref == ID_STATUS_ACTIVE) {
			active[0] = 1;
		}

		if (alarm2Pref == ID_STATUS_ACTIVE) {
			active[1] = 1;
		}

		if (alarm3Pref == ID_STATUS_ACTIVE) {
			active[2] = 1;
		}

		if (alarm4Pref == ID_STATUS_ACTIVE) {
			active[3] = 1;
		}

		if (alarm5Pref == ID_STATUS_ACTIVE) {
			active[4] = 1;
		}

		if (alarm6Pref == ID_STATUS_ACTIVE) {
			active[5] = 1;
		}

		for ( var n = 0; n < TOTAL_PILLS; n++) {
			var j = n + 1;
			if (active[n] == 1) {
				var alarmId = parseInt(localStorage.getItem("REMINDER_ID_" + j));
				var alarm = tizen.alarm.get(alarmId);
				var nextDate = new Date();
				nextDate = alarm.getNextScheduledDate();
				diffs[n] = nextDate.getTime();
			}

		}

		var temp = 0;
		var next = -1;
		for ( var x = 0; x < TOTAL_PILLS; x++) {
			if (active[x] == 1) {
				if (temp == 0) {
					temp = diffs[x];
					next = x;
				} else {
					if (diffs[x] < temp) {
						temp = diffs[x];
						next = x;
					}
				}
			}

		}

		// console.log("next = " + next);
		vNextReminder = next;
		if (vNextReminder != -1) {
			var reminder = vNextReminder + 1;
			$('#id_next_remain').text(getRemainTime(reminder));
			$('#id_next_time').text(
					localStorage.getItem("REMINDER_TIME_" + reminder));
			var iconStatus = "images/icon_bill_" + colorId[vNextReminder] + "_"
					+ localStorage.getItem("REMINDER_BILLS_" + reminder)
					+ ".png";
			$('#id_next_pills').attr("src", iconStatus);
			// console.log("xxcolor id = " + colorId[n]);
		}

	}

}

function getRemainTime(id) {
	var currentTime = new Date();
	var hour = currentTime.getHours();
	var min = currentTime.getMinutes();
	var next = (hour * 60) + (min);
	var reminderTime = localStorage.getItem('REMINDER_TIME_' + id);

	var diffs = ConvertStrToMinutes(reminderTime) - next;
	if (diffs < 0) {
		diffs = (24 * 60) - (next - ConvertStrToMinutes(reminderTime));
	}

	var hour = Math.floor(diffs / 60);
	var min = diffs - (hour * 60);
	var hourStr = (hour < 10) ? "0" + hour : hour;
	var minStr = (min < 10) ? "0" + min : min;
	var timeStr = hourStr + ":" + minStr;
	return timeStr;

}

function playReminderSound(id) {
	var notifiy = parseInt(localStorage.getItem('REMINDER_NOTIFY_' + id));

	if (notifiy == ID_NOTIFY_NORMAL) {
		// console.log("ok");
		audioBeep = document.getElementById("beepAudio");
		audioBeep.play();
	}
}

function checkAlarm() {

	var count = 0;
	var type = localStorage.getItem("ALARM_TYPE");

	var reqAppControl = tizen.application.getCurrentApplication()
			.getRequestedAppControl();

	if (reqAppControl) {
		var appControl = reqAppControl.appControl;
		if (appControl.operation == "GetWell1") {
			vNextAlarmId = 1;
			$.mobile.changePage("#page_reminder_on");
		} else if (appControl.operation == "GetWell2") {
			vNextAlarmId = 2;
			$.mobile.changePage("#page_reminder_on");

		} else if (appControl.operation == "GetWell3") {
			vNextAlarmId = 3;
			$.mobile.changePage("#page_reminder_on");

		} else if (appControl.operation == "GetWell4") {
			vNextAlarmId = 4;
			$.mobile.changePage("#page_reminder_on");
		} else if (appControl.operation == "GetWell5") {
			vNextAlarmId = 5;
			$.mobile.changePage("#page_reminder_on");
		} else if (appControl.operation == "GetWell6") {
			vNextAlarmId = 6;
			$.mobile.changePage("#page_reminder_on");
		}
	}
}
function loadColors() {

	var color = 'COLOR_ID_';
	var colorHex = 'COLOR_HEX_';
	var pillsPref = 'REMINDER_BILLS_';
	var j = 1;
	for ( var n = 0; n < TOTAL_PILLS; n++) {
		colorId[n] = localStorage.getItem(color + j);

		vColors[n] = localStorage.getItem(colorHex + j);
		var pills = parseInt(localStorage.getItem(pillsPref + j));
		vBillsSelector[n] = pills;
		var imgSrc = "icon_bill_" + colorId[n] + "_" + pills + ".png";
		$('#id_med_status_' + j).attr("src", imgSrc);
		var day = document.getElementById('id_days_' + j);
		day.style.color = vColors[n];
		var count = document.getElementById('id_count_' + j);
		count.style.color = vColors[n];
		var voice = document.getElementById('id_btn_switch_' + j);
		voice.style.color = vColors[n];
		var header = document.getElementById('id_reminder_header_' + j);
		header.style.color = vColors[n];
		var active = document.getElementById('id_reminder_active_' + j);
		active.style.color = vColors[n];
		$('#id_reminder_status_' + j).attr("src", imgSrc);
		j++;
	}
}

function InitPref() {

	var reminderTime = "REMINDER_TIME_";
	var notify = 'REMINDER_NOTIFY_';
	var pill = 'REMINDER_BILLS_';
	var status = 'REMINDER_STATUS_';
	var alarmId = 'REMINDER_ID_';
	var snoozeId = 'REMINDER_SNOOZE_ID_';
	var daysId = 'DAYS_ID_';
	var colorId = 'COLOR_ID_';
	var colorHex = 'COLOR_HEX_';

	for ( var n = 1; n <= TOTAL_PILLS; n++) {

		if (localStorage.getItem(reminderTime + n) == null) {
			localStorage.setItem(reminderTime + n, '00:00');
		}

		if (localStorage.getItem(notify + n) == null) {
			localStorage.setItem(notify + n, ID_NOTIFY_NORMAL);
		}

		if (localStorage.getItem(pill + n) == null) {
			localStorage.setItem(pill + n, 1);
		}

		if (localStorage.getItem(status + n) == null) {
			localStorage.setItem(status + n, 501);
		}

		if (localStorage.getItem(alarmId + n) == null) {
			localStorage.setItem(alarmId + n, 0);
		}

		if (localStorage.getItem(snoozeId + n) == null) {
			localStorage.setItem(snoozeId + n, 0);
		}

		if (localStorage.getItem(daysId + n) == null) {
			localStorage.setItem(daysId + n, 0);
		}

		if (localStorage.getItem(colorId + n) == null) {
			localStorage.setItem(colorId + n, colorsArrayId[n - 1]);
		}

		if (localStorage.getItem(colorHex + n) == null) {
			localStorage.setItem(colorHex + n, arrayColors[n - 1]);
		}

	}

	var quickNumbers = localStorage.getItem("QUICK_NUMBERS");
	var quickHours = localStorage.getItem("QUICK_HOURS");

	if (quickNumbers == null) {
		localStorage.setItem("QUICK_NUMBERS", 1)
	}

	if (quickHours == null) {
		localStorage.setItem("QUICK_HOURS", 1)
	}

}