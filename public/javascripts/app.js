var app = new Vue({
  el: "#app",
  data: {
    projects: projects,
    project: {}
  },
  mounted: function() {
    setTimeout(function() {
      if (!projects || !Array.isArray(projects) || !projects.length) {
        return $.get("/update", () => {
          setTimeout(() => {
            window.location.reload();
          }, 10000);
        });
      }
      $("body").addClass("loaded");
    }, 1000);
  },
  methods: {
    setProject: function(event) {
      var project = +$(event.target).data("project");
      this.project = this.projects[project];
    },
    downloadDoc: function(event) {
      event.preventDefault();
      let url = $(event.target).attr("href");
      $.get("/get?url=" + encodeURIComponent(url)).done(function(data) {
        window.open(data);
      });
    }
  }
});

$(".collapse").collapse();
