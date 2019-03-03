define(["qlik", "./get-master-items", "css!./style.css"],
	function (qlik, getMasterItems) {

		return {
			initialProperties: {
				listItems: []
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					MyList: {
						type: "array",
						ref: "listItems",
						label: "Accordion Menu",
						itemTitleRef: "label",
						allowAdd: true,
						allowRemove: true,
						addTranslation: "Add Item",
						items: {
							label: {
								type: "string",
								ref: "label",
								label: "Label",
								expression: "optional"
							},
							isObject: {
								type: "boolean",
								label: "Add Object",
								ref: "isObject",
								defaultValue: false
							},
							MasterObject: {
								type: "string",
								component: "dropdown",
								label: "Master Object",
								ref: "MasterObject",
								options: function () {
									return getMasterItems().then(function (items) {
										return items
									})
								},
								show: function (d) {
									return d.isObject;
								}
							},
							paragraph: {
								label: "Add Text",
								component: "textarea",
								maxlength: 10000,
								ref: "paragraph",
								show: function (d) {
									return !d.isObject;
								},
								expression: "optional"
							}
						},

					},
					settings: {
						uses: "settings",
						items: {
							containerSettings:{
								label:"Extra Settings",
								items:{
								heightObjectContainer: {
									type: "number",
									ref: "heightObjectContainer",
									label: "Height Object Container"
								},
								color: {
									label: "color",
									component: "color-picker",
									ref: "color",
									type: "object",
									dualOutput: true,
									defaultValue: {
										color: "#000000"
									}
								},
								bgcolor: {
									label: "Background Color",
									component: "color-picker",
									ref: "bgcolor",
									type: "object",
									dualOutput: true,
									defaultValue: {
										color: "#ffffff"
									}
								}
							}
								//end
							}
							//end
						}
					}

				}
			},
			support: {
				snapshot: false,
				export: false,
				exportData: false
			},
			resize: function ($element, layout) { },
			paint: function ($element, layout) {
				//add your rendering code here
				var Objid = layout.qInfo.qId,
					app = qlik.currApp(),
					objContainerHeight = layout.heightObjectContainer,
					options = {
						"color":layout.color,
						"bgcolor":layout.bgcolor,
						"ObjHeight":layout.heightObjectContainer
					},
					modals = [];
				//console.log(layout);
				var html = `<div id="menu-wrapper">
								<div id="hamburger-menu" style=""><span></span><span></span><span></span></div>
								<!-- hamburger-menu -->
							</div>`;

				$element.html(html);

				var Accordion = '<div class="menu-container"><ul id="menu-container_' + Objid + '"  class="menu-list accordion"></ul></div>';
				if (!$("#menu-container_" + Objid).length > 0) {
					$('body').append(Accordion);
				}

				$.each(layout.listItems, function (k, v) {
					//console.log(k,v);
					var id = v.cId,
						name = v.label,
						text = v.paragraph,
						isObject = v.isObject,
						MasterObject = v.MasterObject.split("|");
					//console.log(isObject, MasterObject[1]);
					//if(!$("#"+id).length > 0){
					var htm = addaccordion(id, name, text, isObject, MasterObject[1], options);
					$("#" + id).remove();
					$("#menu-container_" + Objid).append(htm);
					//}
				});

				function slideMenu() {
					var activeState = $("#menu-container_" + Objid + ".menu-list").hasClass("active");
					$("#menu-container_" + Objid + ".menu-list").animate({ left: activeState ? "0%" : "-100%" }, 400);
				}
				$("#menu-wrapper").click(function (event) {
					event.stopPropagation();
					$("#hamburger-menu").toggleClass("open");
					$("#menu-container_" + Objid + ".menu-list").toggleClass("active");
					slideMenu();
					$("body").toggleClass("overflow-hidden");
				});

				$(".menu-list").find(".accordion-toggle").click(function () {
					$(this).next().toggleClass("open").slideToggle("fast");
					$(this).toggleClass("active-tab").find(".menu-link").toggleClass("active");
					$(".menu-list .accordion-content").not($(this).next()).slideUp("fast").removeClass("open");
					$(".menu-list .accordion-toggle").not(jQuery(this)).removeClass("active-tab").find(".menu-link").removeClass("active");
					// add object

					//objcontainer
					//objExists
					//objID
					var objExists = $(this).attr("objExists"),
						objID = $(this).attr("objID"),
						objcontainer = $(this).attr("objcontainer");
					if (objExists == "true") {
						//console.log(objcontainer, objExists, objID);
						cleanUp();
						app.getObject(objcontainer, objID).then(function (vis) {
							modals.push(vis);
						});
					}
				});

				function cleanUp() {
					$.each(modals, function (k, v) {
						v.close();
					});
					modals = [];
				}
				//needed for export
				return qlik.Promise.resolve();
			}
		};

	});


function addaccordion(id, name, text, isObject, MasterObject, options) {
	var adAccordion = '<li style="background:'+options.bgcolor.color+';" objcontainer="obj_' + id + '" objExists="' + isObject + '" objID="' + MasterObject + '" id="' + id + '" class="toggle accordion-toggle"><span class="icon-plus"></span><a class="menu-link" href="javascript:void(0)" color:'+options.color.color+';>' + name + '</a></li>';
	var container = '<div id="obj_' + id + '" style="height:' + options.ObjHeight + 'px;"></div>';
	var content = '<ul id="content_' + id + '" class="menu-submenu accordion-content">' + (isObject ? container : text) + '</ul>';
	return adAccordion + content;
}
