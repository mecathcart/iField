define([ 
    "backbone", 
    "handlebars",
    "activity/Activity",
    "corpus/Corpus",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "data_list/DataList",
    "data_list/DataLists",
    "data_list/DataListReadView",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumFieldEditView",
    "datum/DatumState",
    "datum/DatumStates",
    "datum/DatumStateEditView",
    "permission/Permission",
    "permission/Permissions",
    "permission/PermissionEditView",
    "datum/Session",
    "datum/Sessions",
    "datum/SessionReadView",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    Activity,
    Corpus,
    Comment,
    Comments,
    CommentReadView,
    DataList,
    DataLists,
    DataListReadView,
    DatumField,
    DatumFields,
    DatumFieldEditView,
    DatumState,
    DatumStates,
    DatumStateEditView,
    Permission,
    Permissions,
    PermissionEditView,
    Session,
    Sessions,
    SessionReadView,
    UpdatingCollectionView
) {
  var CorpusEditView = Backbone.View.extend(
  /** @lends CorpusReadFullScreenView.prototype */
  {
    /**
     * @class This is the corpus view. To the user it looks like a
     *        Navigation panel on the main dashboard screen, which
     *        displays a menu of things the User can do (ex. open a new
     *        session, browse all entries, etc.).
     * 
     * @property {String} format Must be set when the CorpusEditView is
     * initialized. Valid values are "centreWell" and
     * "fullscreen" and "leftSide" and "modal"
     * 
     * @description Starts the Corpus and initializes all its children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("CORPUS EDIT init: " );
      this.changeViewsOfInternalModels();
     
      // If the model's title changes, chances are its a new corpus, re-render its internal models.
      this.model.bind('change:title', function(){
        this.changeViewsOfInternalModels();
        this.render();
      }, this);
      
      //TODO test this
//      this.model.bind('error', function(e){
//        window.appView.toastUser(e); //The e is the model itself, not sure how to get the erros out. At the moment they are only produced by validating public vs  private
//
//      });
      //TOOD if the sessions and data lists arent up-to-date, turn these on
//      this.model.bind('change:sessions', function(){
//        this.render();
//      }, this);
//      this.model.bind('change:dataLists', function(){
//        this.render();
//      }, this);
    },

    /**
     * The underlying model of the CorpusReadFullScreenView is a Corpus.
     */    
    model : Corpus,
   
    /**
     * Events that the CorpusReadFullScreenView is listening to and their handlers.
     */
    events : {
      "click .icon-book": "showReadonly",
      //Add button inserts new Comment
      "click .add-comment-corpus" : function(e) {
          if(e){
            e.stopPropagation();
            e.preventDefault();
          }
          var commentstring = this.$el.find(".comment-new-text").val();
          
          this.model.insertNewComment(commentstring);
          this.$el.find(".comment-new-text").val("");
          
      },

      //Add button inserts new Datum State
      "click .add-datum-state" : 'insertNewDatumState',
      
      //Add button inserts new Datum Field
      "click .add-datum-field" : 'insertNewDatumField',
      "click .icon-resize-small" : 'resizeSmall',
      "click .resize-full" : "resizeFullscreen",
      
      //corpus menu buttons
      "click .new-datum" : "newDatum",
      "click .new-data-list" : "newDataList",
      "click .new-session" : "newSession",
      "click .new-corpus" : "newCorpus",
      
      //text areas in the edit view
      "blur .corpus-title-input" : "updateTitle",
      "blur .corpus-description-input" : "updateDescription",
      "blur .public-or-private" : "updatePublicOrPrivate",
      "click .save-corpus" : "updatePouch",
    },

    /**
     * The Handlebars template rendered as the CorpusFullscreenView.
     */
    templateFullscreen : Handlebars.templates.corpus_edit_embedded,
    
    /**
     * The Handlebars template rendered as the CorpusWellView.
     */
    templateCentreWell : Handlebars.templates.corpus_edit_embedded,
    
    /**
     * The Handlebars template rendered as the Summary
     */
    templateSummary : Handlebars.templates.corpus_summary_edit_embedded,
       
    templateNewCorpus : Handlebars.templates.corpus_edit_new_modal,
    /**
     * Renders the CorpusReadFullScreenView and all of its child Views.
     */
    render : function() {
      if (this.model == undefined) {
        Utils.debug("\tCorpus model was undefined.");
        return this;
      }
      Utils.debug("CORPUS EDIT render: ");
      if( this.format != "modal"){
        window.appView.currentCorpusEditView.destroy_view();
        window.appView.currentCorpusReadView.destroy_view();
      }

      var jsonToRender = this.model.toJSON();
      try{
        jsonToRender.username = this.model.get("team").get("username");
      }catch(e){
        Utils.debug("Problem getting the usrname of the corpus' team");
      }
      if (this.format == "centreWell") {
        Utils.debug("CORPUS Edit center render: " );
          // Display the CorpusReadFullScreenView
          this.setElement($("#corpus-embedded"));
          $(this.el).html(this.templateCentreWell(jsonToRender));

          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
          // Display the DataListsView
         this.dataListsView.el = this.$('.datalists-updating-collection'); 
         this.dataListsView.render();
          
         // Display the SessionsView
         this.sessionsView.el = this.$('.sessions-updating-collection'); 
         this.sessionsView.render();
         
         // Display the PermissionsView
         this.permissionsView.el = this.$('.permissions-updating-collection');
         this.permissionsView.render();
         
          // Display the DatumFieldsView
          this.datumFieldsView.el = this.$('.datum_field_settings');
          this.datumFieldsView.render();
          
          // Display the DatumStatesView
          this.datumStatesView.el = this.$('.datum_state_settings');
          this.datumStatesView.render();
          
        //Localize for all embedded view
          $(this.el).find(".locale_Show_in_Dashboard").attr("title", chrome.i18n.getMessage("locale_Show_in_Dashboard"));
          $(this.el).find(".locale_Sessions_associated").html(chrome.i18n.getMessage("locale_Sessions_associated"));
          $(this.el).find("locale_Session_Description_tooltip").attr("title", chrome.i18n.getMessage("locale_Session_Description_tooltip"));
          $(this.el).find(".locale_Datalists_associated").html(chrome.i18n.getMessage("locale_Datalists_associated"));
          $(this.el).find(".locale_Permissions_associated").html(chrome.i18n.getMessage("locale_Permissions_associated"));
          $(this.el).find(".locale_Datum_field_settings").html(chrome.i18n.getMessage("locale_Datum_field_settings"));
          $(this.el).find(".locale_Datum_state_settings").html(chrome.i18n.getMessage("locale_Datum_state_settings"));
          $(this.el).find(".locale_Add").html(chrome.i18n.getMessage("locale_Add"));

          //Localize for only Edit view.
          $(this.el).find(".locale_Public_or_Private").html(chrome.i18n.getMessage("locale_Public_or_Private"));
          $(this.el).find(".locale_Encrypt_if_confidential").html(chrome.i18n.getMessage("locale_Encrypt_if_confidential"));
          $(this.el).find(".locale_Help_Text").html(chrome.i18n.getMessage("locale_Help_Text"));
          $(this.el).find(".locale_Add_New_Datum_Field_Tooltip").attr("title", chrome.i18n.getMessage("locale_Add_New_Datum_Field_Tooltip"));
          $(this.el).find(".locale_Add_Placeholder").attr("placeholder", chrome.i18n.getMessage("locale_Add_Placeholder"));
          $(this.el).find(".locale_Green").html(chrome.i18n.getMessage("locale_Green"));
          $(this.el).find(".locale_Orange").html(chrome.i18n.getMessage("locale_Orange"));
          $(this.el).find(".locale_Red").html(chrome.i18n.getMessage("locale_Red"));
          $(this.el).find(".locale_Blue").html(chrome.i18n.getMessage("locale_Blue"));
          $(this.el).find(".locale_Teal").html(chrome.i18n.getMessage("locale_Teal"));
          $(this.el).find(".locale_Black").html(chrome.i18n.getMessage("locale_Black"));
          $(this.el).find(".locale_Default").html(chrome.i18n.getMessage("locale_Default"));
          $(this.el).find(".locale_Add_New_Datum_State_Tooltip").attr("title", chrome.i18n.getMessage("locale_Add_New_Datum_State_Tooltip"));
          $(this.el).find(".locale_Save").html(chrome.i18n.getMessage("locale_Save"));

      } else if (this.format == "fullscreen") {
        Utils.debug("CORPUS EDIT FULLSCREEN render: " );

        this.setElement($("#corpus-fullscreen"));
        $(this.el).html(this.templateFullscreen(jsonToRender));

        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();
        
        // Display the DataListsView
        this.dataListsView.el = this.$('.datalists-updating-collection'); 
        this.dataListsView.render();
        
        // Display the SessionsView
        this.sessionsView.el = this.$('.sessions-updating-collection'); 
        this.sessionsView.render();
        
        // Display the PermissionsView
        this.permissionsView.el = this.$('.permissions-updating-collection');
        this.permissionsView.render();

        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_field_settings');
        this.datumFieldsView.render();

        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();

      //Localize for all fullscreen view 
        $(this.el).find(".locale_Show_in_Dashboard").attr("title", chrome.i18n.getMessage("locale_Show_in_Dashboard"));
        $(this.el).find(".locale_Sessions_associated").html(chrome.i18n.getMessage("locale_Sessions_associated"));
        $(this.el).find(".locale_Datalists_associated").html(chrome.i18n.getMessage("locale_Datalists_associated"));
        $(this.el).find(".locale_Permissions_associated").html(chrome.i18n.getMessage("locale_Permissions_associated"));
        $(this.el).find(".locale_Datum_field_settings").html(chrome.i18n.getMessage("locale_Datum_field_settings"));
        $(this.el).find(".locale_Datum_state_settings").html(chrome.i18n.getMessage("locale_Datum_state_settings"));
        $(this.el).find(".locale_Add").html(chrome.i18n.getMessage("locale_Add"));

        //Localize for only Edit view.
        $(this.el).find(".locale_Public_or_Private").html(chrome.i18n.getMessage("locale_Public_or_Private"));
        $(this.el).find(".locale_Encrypt_if_confidential").html(chrome.i18n.getMessage("locale_Encrypt_if_confidential"));
        $(this.el).find(".locale_Help_Text").html(chrome.i18n.getMessage("locale_Help_Text"));
        $(this.el).find(".locale_Help_Text_Placeholder").attr("placeholder", chrome.i18n.getMessage("locale_Help_Text_Placeholder"));
        $(this.el).find(".locale_Add_New_Datum_Field_Tooltip").attr("title", chrome.i18n.getMessage("locale_Add_New_Datum_Field_Tooltip"));
        $(this.el).find(".locale_Add_Placeholder").attr("placeholder", chrome.i18n.getMessage("locale_Add_Placeholder"));
        $(this.el).find(".locale_Green").html(chrome.i18n.getMessage("locale_Green"));
        $(this.el).find(".locale_Orange").html(chrome.i18n.getMessage("locale_Orange"));
        $(this.el).find(".locale_Red").html(chrome.i18n.getMessage("locale_Red"));
        $(this.el).find(".locale_Blue").html(chrome.i18n.getMessage("locale_Blue"));
        $(this.el).find(".locale_Teal").html(chrome.i18n.getMessage("locale_Teal"));
        $(this.el).find(".locale_Black").html(chrome.i18n.getMessage("locale_Black"));
        $(this.el).find(".locale_Default").html(chrome.i18n.getMessage("locale_Default"));
        $(this.el).find(".locale_Add_New_Datum_State_Tooltip").attr("title", chrome.i18n.getMessage("locale_Add_New_Datum_State_Tooltip"));
        $(this.el).find(".locale_Save").html(chrome.i18n.getMessage("locale_Save"));

      } else if (this.format == "leftSide"){
        Utils.debug("CORPUS EDIT LEFTSIDE render: " );
        this.setElement($("#corpus-quickview"));
        $(this.el).html(this.templateSummary(jsonToRender));
      
        //Localize left side edit view
        $(this.el).find(".locale_Show_corpus_settings").attr("title", chrome.i18n.getMessage("locale_Show_corpus_settings"));
      
      }else if (this.format == "modal"){
        Utils.debug("CORPUS EDIT MODAL render: " );
        this.setElement($("#new-corpus-modal"));
        $(this.el).html(this.templateNewCorpus(jsonToRender));
        
      }else {
        throw("You have not specified a format that the CorpusEditView can understand.");
      }
      if (this.format != "modal"){
        //Localize corpus menu for all corpus views, except new corpus modal
        $(this.el).find(".locale_New_menu").html(chrome.i18n.getMessage("locale_New_menu"));
        $(this.el).find(".locale_New_Datum").html(chrome.i18n.getMessage("locale_New_Datum"));
        $(this.el).find(".locale_New_Data_List").html(chrome.i18n.getMessage("locale_New_Data_List"));
        $(this.el).find(".locale_New_Session").html(chrome.i18n.getMessage("locale_New_Session"));
        $(this.el).find(".locale_New_Corpus").html(chrome.i18n.getMessage("locale_New_Corpus"));
        $(this.el).find(".locale_Data_menu").html(chrome.i18n.getMessage("locale_Data_menu"));
        $(this.el).find(".locale_Import_Data").html(chrome.i18n.getMessage("locale_Import_Data"));
        $(this.el).find(".locale_Export_Data").html(chrome.i18n.getMessage("locale_Export_Data"));
        $(this.el).find(".locale_Show_Readonly").attr("title", chrome.i18n.getMessage("locale_Show_Readonly"));
      }else{
        //Localize the new corpus menu
        $(this.el).find(".locale_New_Corpus").html(chrome.i18n.getMessage("locale_New_Corpus"));
        $(this.el).find(".locale_New_Corpus_Instructions").html(chrome.i18n.getMessage("locale_New_Corpus_Instructions"));
        $(this.el).find(".locale_Warning").html(chrome.i18n.getMessage("locale_Warning"));
        $(this.el).find(".locale_New_Corpus_Warning").html(chrome.i18n.getMessage("locale_New_Corpus_Warning"));
        $(this.el).find(".locale_Public_or_Private").html(chrome.i18n.getMessage("locale_Public_or_Private"));
        $(this.el).find(".locale_Cancel").html(chrome.i18n.getMessage("locale_Cancel"));
        $(this.el).find(".locale_Save").html(chrome.i18n.getMessage("locale_Save"));
      }
      //Localize the title and description labels
      $(this.el).find(".locale_Title").html(chrome.i18n.getMessage("locale_Title"));
      $(this.el).find(".locale_Description").html(chrome.i18n.getMessage("locale_Description"));
      
      return this;
    },
    /**
     * 
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      Utils.debug("DESTROYING CORPUS EDIT VIEW "+ this.format);
      //COMPLETELY UNBIND THE VIEW
      this.undelegateEvents();

      $(this.el).removeData().unbind(); 

      //Remove view from DOM
//    this.remove();  
//    Backbone.View.prototype.remove.call(this);
    },
    changeViewsOfInternalModels : function(){
      //Create a CommentReadView     
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });
      
      // Create a DataList List
      this.dataListsView = new UpdatingCollectionView({
        collection : this.model.get("dataLists"),
        childViewConstructor : DataListReadView,
        childViewTagName     : 'li',
        childViewFormat      : "link"
      });
      
      this.model.loadPermissions();
      //Create a Permissions View
      this.permissionsView = new UpdatingCollectionView({
        collection : this.model.permissions,
        childViewConstructor : PermissionEditView,
        childViewTagName     : 'li',
        childViewClass       : "breadcrumb row span12"
      });
      
      //Create a Sessions List 
       this.sessionsView = new UpdatingCollectionView({
         collection : this.model.get("sessions"),
         childViewConstructor : SessionReadView,
         childViewTagName     : 'li',
         childViewFormat      : "link"  
       });
      

      //Create a DatumFieldsView     
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus",
        childViewClass       : "breadcrumb"
      });
          
      // Create a DatumStatesView    
      this.datumStatesView = new UpdatingCollectionView({
        collection           : this.model.get("datumStates"),
        childViewConstructor : DatumStateEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus"
      });
            
    },
    
    updateTitle: function(){
      this.model.set("title",this.$el.find(".corpus-title-input").val());
      window.appView.addUnsavedDoc(this.model.id);

    },
    
    updateDescription: function(){
      this.model.set("description",this.$el.find(".corpus-description-input").val());
      window.appView.addUnsavedDoc(this.model.id);

    },
    updatePublicOrPrivate : function(){
      this.model.set("publicCorpus",this.$el.find(".public-or-private").val());
      window.appView.addUnsavedDoc(this.model.id);

    },
   
    //Functions assoicate with the corpus menu
    newDatum : function(e) {
      if(e){
//        e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
      }
      appView.datumsEditView.newDatum();
      app.router.showDashboard();
      Utils.debug("CLICK NEW DATUM EDIT CORPUS VIEW.");
    },
    
    newDataList : function(e) {
      if(e){
//      e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
      }
      //take the user to the search so they can create a data list using the search feature.
      window.appView.toastUser("Below is the Advanced Search, this is the easiest way to make a new Data List.","alert-info","How to make a new Data List:");
      app.router.showEmbeddedSearch();
    },
    
    newSession : function(e) {
      if(e){
//      e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
      }
      $("#new-session-modal").modal("show");
      //Save the current session just in case
      window.app.get("currentSession").saveAndInterConnectInApp(function(){
        //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
        window.appView.sessionNewModalView.model = new Session({
          pouchname : window.app.get("corpus").get("pouchname"),
          sessionFields : window.app.get("currentSession").get("sessionFields").clone()
        });
        window.appView.sessionNewModalView.model.set("comments", new Comments());
        window.appView.sessionNewModalView.render();
      });
    },
    
    newCorpus : function(e){
      if(e){
//      e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
      }
      $("#new-corpus-modal").modal("show");
      //Save the current session just in case
      window.app.get("corpus").saveAndInterConnectInApp();
      //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
      var attributes = JSON.parse(JSON.stringify(window.app.get("corpus").attributes));
      // Clear the current data list's backbone info and info which we shouldnt clone
      attributes._id = undefined;
      attributes._rev = undefined;
      /*
       * WARNING this might not be a good idea, if you find strange side
       * effects in corpora in the future, it might be due to this way
       * of creating (duplicating) a corpus. However with a corpus it is
       * a good idea to duplicate the permissions and settings so that
       * the user won't have to redo them.
       */
      attributes.title = window.app.get("corpus").get("title")+ " copy";
      attributes.titleAsUrl = window.app.get("corpus").get("titleAsUrl")+"Copy";
      attributes.description = "Copy of: "+window.app.get("corpus").get("description");
      attributes.pouchname = window.app.get("corpus").get("pouchname")+"copy";
      attributes.couchConnection.pouchname = window.app.get("corpus").get("pouchname")+"copy";
      attributes.dataLists = new DataLists();
      attributes.sessions = new Sessions();
      attributes.comments = new Comments();

      window.appView.corpusNewModalView.model = new Corpus(attributes);
      window.appView.corpusNewModalView.render();
    },

    
    // This the function called by the add button, it adds a new datum field both to the 
    // collection and the model
    insertNewDatumField : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      //don't add blank fields
      if(this.$el.find(".choose_add_field").val().toLowerCase().replace(/ /g,"_") == ""){
        return;
      }
      // Remember if the encryption check box was checked
      var checked = this.$el.find(".add_shouldBeEncrypted").is(':checked') ? "checked" : "";
      
      // Create the new DatumField based on what the user entered
      var m = new DatumField({
        "label" : this.$el.find(".choose_add_field").val().toLowerCase().replace(/ /g,"_"),
        "shouldBeEncrypted" : checked,
        "help" : this.$el.find(".add_help").val()
      });

      // Add the new DatumField to the Corpus' list for datumFields
      this.model.get("datumFields").add(m);
      
      // Reset the line with the add button
      this.$el.find(".choose_add_field").val("");//.children("option:eq(0)").attr("selected", true);
      this.$el.find(".add_help").val("");
      window.appView.addUnsavedDoc(this.model.id);

    },
 
    //This the function called by the add button, it adds a new datum state both to the collection and the model
    insertNewDatumState : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      var m = new DatumField({
        "state" : this.$el.find(".add_input").val(),
        "color" : this.$el.find(".add_color_chooser").val()
      });
      this.model.get("datumStates").add(m);
      window.appView.addUnsavedDoc(this.model.id);

    },
  //This the function called by the add button, it adds a new datum state both to the collection and the model
    insertNewPermission : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      //TODO perform a server call to do this, and display the the results/errors
      var p = this.model.permissions.where({role: this.$el.find(".choose-add-permission-role").val()})[0];
      if(p){
        p.get("usernames").push(this.$el.find(".choose-add-permission-username").val());
      }

    },
    resizeSmall : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.app.router.showDashboard();
    },
    resizeFullscreen : function(e){
      Utils.debug("CORPUS EDIT starts to render fullscreen. " );
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.format = "fullscreen";
      this.render();
      window.app.router.showFullscreenCorpus();
    },
    //This is the function that is  bound to the book button
    showReadonly : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.appView.currentCorpusReadView.format = this.format;
      window.appView.currentCorpusReadView.render();
    },
    
    /**
     * saves the current corpus to pouch, if the corpus id doesnt match the
     * corpus in the app, It attempts to save it to to its pouch, and create new
     * session and data lists, and then save them to pouch. The new session and
     * datalist are set to the current ones, but the views are not reloaded yet,
     * then the corpus and session and data lists are saved via the
     * app.saveAndInterConnectInApp function. after that the app
     * needs to be reloaded entirely (page refresh), or we can attempt to attach
     * the views to these new models.
     */
    updatePouch : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();

      }
      var self = this;
      this.model.saveAndInterConnectInApp(function(){
        if(this.format == "modal"){
          $("#new-corpus-modal").modal("hide");
          window.appView.toastUser("The permissions and datum fields and session fields were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
          alert("TODO check if new corpus succeeds, will set as current also.");
        }
        window.appView.currentCorpusReadView.format = self.format;
        window.appView.currentCorpusReadView.render();
        
      },function(){
        if(this.format == "modal"){
          $("#new-corpus-modal").modal( "hide");
          alert("There was a problem somewhere loading and saving the new corpus.");
          window.appView.toastUser("The permissions and datum fields and session fields were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
        }
        window.appView.currentCorpusReadView.format = self.format;
        window.appView.currentCorpusReadView.render();
      });
    }
  });

  return CorpusEditView;
});