$(document).ready(function(){

  // setting up svg

  let area_width = $('.data-section5').innerWidth();
  let area_height = $('.data-section5').innerHeight();

  let area_margin = {
    left: 150,
    right: 150,
    top: 200,
    bottom: 150
  }

  const area_svg = d3.select('#chart-area-5')
    .append("svg")
    .attr('class', 'svg-graph5')
    .attr('width', area_width)
    .attr('height', area_height)

  const area_g = area_svg.append('g')

  // pulling data from server

  d3.csv("https://visualeyes-server.herokuapp.com/statistics.csv").then(function(data) {
        data.forEach(function(d) {
          d.area = +d.area
        })

        // nesting to allow usage of year as key

        let years = d3.nest()
          .key(function(d) {
            if (d.year === '2017') {
              return d.year;
            }
          })
          .entries(data);

        const year2017 = years[1].values;

        // color-coding countries
        var color = d3.scaleOrdinal()
          .domain(year2017.map(function(d) {
            return d.country_name;
          }))
          .range(['#ffba49', '#20a39e', '#DC143C', '#663399', '#f2e3bc', '#ff8552', '#f76f8e', '#14cc60', '#931621', '#87CEEB', '#C0C0C0', '#d1f5ff', '#7d53de', '#e5446d', '#BC8F8F']);

        // scale for countries
        let size = d3.scaleLog()
          .domain([40000, 10000000])
          .range([15, 100])
          .base(2)


        // Tooltips setup
        const tooltip = d3.select('#chat-area-5')
          .append('div')
          .data(year2017)
          .attr('class', 'd3-tip')
          .style('position', 'absolute')
          .style('z-index', '10')
          .style('visibility', 'hidden')

        // thanks to: http://bl.ocks.org/biovisualize/1016860

        // mouseover tooltip functions
        const tooltip_mouseover = function(e, year2017) {
          tooltip.style('visibility', 'visible')
            .text(function() {
              return `${ e.country_name }: ${e.area}`
            })
        }

        const tooltip_mouseout = function(year2017) {
          tooltip.style('visibility', 'hidden')
        }

        const tooltip_mousemove = function(year2017) {
          tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        }

        // initializing the circle

        const node = area_g.selectAll('circle')
          .data(year2017)
          .enter()
          .append('circle')
          .attr('class', 'node')
          .attr("r", function(year2017) {
            return size(year2017.area)
          })
          .attr('cx', area_width / 2)
          .attr('cy', area_height / 2)
          .style('fill', function(d) {
            return color(d.country_name)
          })
          .style('fill-opacity', 0.8)
          .attr('stroke', 'black')
          .style("stroke-width", 1)
          .on("mouseover", tooltip_mouseover)
          .on('mousemove', tooltip_mousemove)
          .on('mouseout', tooltip_mouseout)
          .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

        // forces

        const simulation = d3.forceSimulation()
          // .force("x", d3.forceX().strength(0.5).x(width/2))
          // .force("y", d3.forceY().strength(0.1).y( height/2 ))
          .force('center', d3.forceCenter().x(area_width / 2).y(area_height / 2)) //attracts to centre of svg
          .force('charge', d3.forceManyBody().strength(.1)) //Nodes are attracted to each other
          .force("collide", d3.forceCollide().strength(.2).radius(function(d) {
            return size((d.area) + 3)
          }).iterations(1)) //force avoids circle collision

        simulation
          .nodes(year2017)
          .on('tick', function(year2017) {
            node
              .attr('cx', function(year2017) {
                return year2017.x;
              })
              .attr('cy', function(year2017) {
                return year2017.y;
              })
          })

        // drag functions

        function dragstarted(year2017) {
          if (!d3.event.active) simulation.alphaTarget(.03).restart();
          year2017.fx = year2017.x;
          year2017.fy = year2017.y;
        }

        function dragged(year2017) {
          year2017.fx = d3.event.x;
          year2017.fy = d3.event.y;
        }

        function dragended(year2017) {
          if (!d3.event.active) simulation.alphaTarget(.03);
          year2017.fx = null;
          year2017.fy = null;
        }

        // Event Listeners

        let countries = ['all']
        let selectedAll = false;

        const clearAll = function() {
          let i = countries.indexOf('all');
          if (i !== -1) {
            countries.splice(i, 1);
          }
          $('#all').prop('checked', false);
        }

        console.log(node);


        function update_data(data) {
          console.log(year2017);
          let updatedData = year2017.filter(function(d) {
            if (selectedAll) {
              return true;
            } else {
              for (var i = 0; i < countries.length; i++) {
                if (d.country_name === countries[i]) {
                  return d;
                }
              }
            }

          })

          area_g.selectAll('circle')
            .remove();

          let nodes3 = population_g.selectAll('circle')
            .data(updatedData)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr("r", function(d) {
              return size(d.population)
            })
            .attr('cx', area_width / 2)
            .attr('cy', area_height / 2)
            .style('fill', function(d) {
              return color(d.country_name)
            }) //come back to for colours
            .style('fill-opacity', 0.8)
            .attr('stroke', 'black')
            .style("stroke-width", 1)
            .on("mouseover", tooltip_mouseover)
            .on('mousemove', tooltip_mousemove)
            .on('mouseout', tooltip_mouseout)
            .call(d3.drag()
              .on('start', dragstarted)
              .on('drag', dragged)
              .on('end', dragended));

              console.log(year2017);
              console.log(updatedData);

              const simulation3 = d3.forceSimulation()
                .force('center', d3.forceCenter()
                  .x(population_width / 2).y(population_height / 2))
                .force('charge', d3.forceManyBody()
                  .strength(.1))
                .force("collide", d3.forceCollide()
                  .strength(.2)
                  .radius(function(d) {
                  return size((d.population) + 3)
                }).iterations(1))

              simulation3
                .nodes(updatedData)
                .on('tick', function(updatedData) {
                  nodes3
                    .attr('cx', function(year2017) {
                      return year2017.x;
                    })
                    .attr('cy', function(year2017) {
                      return year2017.y;
                    })
                })

        }


        $('#all').on('change', function() {
          if (this.checked) {
            countries = ['all']
            selectedAll = true;
            $('#Australia').prop('checked', false);
            $('#Brazil').prop('checked', false);
            $('#Canada').prop('checked', false);
            $('#China').prop('checked', false);
            $('#France').prop('checked', false);
            $('#India').prop('checked', false);
            $('#Ireland').prop('checked', false);
            $('#Italy').prop('checked', false);
            $('#Mexico').prop('checked', false);
            $('#Nigeria').prop('checked', false);
            $('#Netherlands').prop('checked', false);
            $('#New-Zealand').prop('checked', false);
            $('#Thailand').prop('checked', false);
            $('#United-Kingdom').prop('checked', false);
            $('#United-States').prop('checked', false);
          } else {
            let index = countries.indexOf(this.value);
            countries.splice(index, 1);
            allSelected = false;
          }
          update_data(data)
        });

        $('#Australia').on('change', function() {
            if (this.checked) {
                clearAll();
                countries.push(this.value)
                selectedAll = false;
                selectedAll = false;
              }
              else {
                let index = countries.indexOf(this.value);
                countries.splice(index, 1);
              }
              update_data(data)
            });

          $('#Brazil').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value);
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#Canada').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#China').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#France').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#India').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#Ireland').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#Italy').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#Mexico').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#Nigeria').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#Netherlands').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#New-Zealand').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#Thailand').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#United-Kingdom').on('change', function() {
            if (this.checked) {
              clearAll();
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });

          $('#United-States').on('change', function() {
            if (this.checked) {
              clearAll();
              console.log(this.value);
              countries.push(this.value)
              selectedAll = false;
            } else {
              let index = countries.indexOf(this.value);
              countries.splice(index, 1);
            }
            update_data(data)
          });


        });
})