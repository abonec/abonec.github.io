const image_url = "https://topmission-storage.s3.amazonaws.com/image/file/21527386/normal_photo.jpg";
const image_width = 1200;
const image_height = 900;


const div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const lineFunction = d3.line()
  .x(function (d) {
    return d.x;
  })
  .y(function (d) {
    return d.y;
  });


function createSvg(img) {
  return d3.select("body").append("svg")
    // .attr("width", image_width)
    // .attr("height", image_height)
    .attr("viewBox", `0 0 ${image_width} ${image_height}`);
}

function addImage(container, url) {
  return container.append('svg:image')
    .attr('xlink:href', url)
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', image_width)
    .attr('height', image_height);
}

function addBox(container, coordinates) {
  const {x, y, width, height, isValid} = coordinates;
  if (isValid) {
    return container.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", width)
      .attr("height", height)
      .style("stroke-width", '1px')
      .attr("opacity", '0.6')
      ;
  } else {
    console.log(`${JSON.stringify(coordinates)} is invalid`);
    return container;
  }
}

const defaultStrokeWidth = 2;
const selectedStrokeWidth = 4;

function addBoundingBox(container, sku, boxCoordinates) {
  const coordinates = convertCoordinates(boxCoordinates);
  const path = convertCoordinatesToPath(coordinates);
  const bbox = container.append('path').attr('d', lineFunction(path)).attr('stroke', 'blue').attr('stroke-width', defaultStrokeWidth).attr('fill', 'none');
  const box = addBox(container, coordinates);

  box.on('mouseover', () => {
    bbox.attr('stroke-width', selectedStrokeWidth);
    div.transition()
      .duration(200)
      .style("opacity", .9);
    div.html(sku.name)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
  }).on('mouseout', () => {
    bbox.attr('stroke-width', defaultStrokeWidth);
    div.transition()
      .duration(500)
      .style("opacity", 0);
  })

}

window.max_x = 0;
window.max_y = 0;

const diff_x = -60;
const diff_y = 40;

function convertCoordinates(coordinates) {
  let {x1, y1, x2, y2} = coordinates;
  x1 = +x1 + diff_x;
  x2 = +x2 + diff_x;
  y1 = +y1 + diff_y;
  y2 = +y2 + diff_y;

  if (x1 > x2 || y2 < y1) {
    return {isValid: false};
  }
  const x = x1;
  const y = y1;
  const width = x2 - x1;
  const height = y2 - y1;
  if (height < 0) {
    debugger;
  }
  return {x, y, width, height, isValid: true};
}

function convertCoordinatesToPath(coordinates) {
  const {x, y, width, height} = coordinates;
  return [
    {x, y},
    {x: x + width, y},
    {x: x + width, y: y + height},
    {x, y: y + height},
    {x, y},
    {x: x + width, y},
  ];

}

const container = createSvg();
addImage(container, image_url);

const photos = test_json.result.photos;
for (const image_tag in photos) {
  if (photos.hasOwnProperty(image_tag)) {
    const photo = photos[image_tag];
    photo.forEach((sku) => {
      const boxes = sku.box;
      boxes.forEach((box) => {
        addBoundingBox(container, sku, box);
      });
    });
  }
}

