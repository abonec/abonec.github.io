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
  const {x, y, w, h, isValid} = coordinates;
  if (isValid) {
    return container.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", w)
      .attr("height", h)
      .style("stroke-width", '1px')
      .attr("opacity", '0')
      ;
  } else {
    console.log(`${JSON.stringify(coordinates)} is invalid`);
    return container;
  }
}

const defaultStrokeWidth = 2;
const selectedStrokeWidth = 4;


function addBoundingBox(container, name, coordinates) {
  const path = convertCoordinatesToPath(coordinates);
  const bbox = container.append('path').attr('d', lineFunction(path)).attr('stroke', 'blue').attr('stroke-width', defaultStrokeWidth).attr('fill', 'none');
  const box = addBox(container, coordinates);

  box.on('mouseover', () => {
    bbox.attr('stroke-width', selectedStrokeWidth);
    div.transition()
      .duration(200)
      .style("opacity", .9);
    div.html(name)
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

function convertCoordinatesIR(coordinates) {
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
  const w = x2 - x1;
  const h = y2 - y1;
  if (h < 0) {
    debugger;
  }
  return {x, y, w, h, isValid: true};
}

function convertCoordinatesIC(coordinates) {
  const {x, y, w, h} = coordinates;
  return {
    x: x - w / 2,
    y: y - h / 2,
    w, h,
  };

}

function convertCoordinatesToPath(coordinates) {
  const {x, y, w, h} = coordinates;
  return [
    {x, y},
    {x: x + w, y},
    {x: x + w, y: y + h},
    {x, y: y + h},
    {x, y},
    {x: x + w, y},
  ];

}

const container = createSvg();
addImage(container, image_url);

if (true) {
  const {annotations} = ic_test.json;
  for (let box of annotations) {
    coordinates = Object.assign({}, convertCoordinatesIC(box), {isValid: true});
    addBoundingBox(container, box.name, coordinates);
  }
} else {
  const photos = test_json.result.photos;
  for (const image_tag in photos) {
    if (photos.hasOwnProperty(image_tag)) {
      const photo = photos[image_tag];
      photo.forEach((sku) => {
        const boxes = sku.box;
        boxes.forEach((box) => {
          const coordinates = convertCoordinatesIR(box);
          addBoundingBox(container, sku.name, coordinates);
        });
      });
    }
  }
}


