import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EuiButtonEmpty, EuiButtonIcon, EuiCard, EuiFlexItem, EuiFlexGroup } from '@elastic/eui';

export class RequirementCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: 0,
      carrusel: [],
      carruselLength: 0
    };
    this.chunkSize = 4;
    this.chartNum = 250;
    this.expanded = false;
  }

  buildCarrusel() {
    const items = this.props.items.map((req, index) => {
      const title = `${this.props.reqTitle}: ${req.title}`;
      const expandMessage = this.expanded ? 'Show less' : 'More info'
      const cardFooterContent = (
        <EuiButtonEmpty
          iconType="iInCircle"
          size="xs"
          className="footer-req wz-margin--10"
          onClick={() => this.expand()}>
          {expandMessage}
        </EuiButtonEmpty>
      );
      if (req.content.length >= this.chartNum) {
        const content = this.expanded ? req.content : `${req.content.substring(0, this.chartNum - 5)}...`
        return (
          <EuiFlexItem key={index}>
            <EuiCard
              title={title}
              description={content}
              textAlign="left"
              className="wz-padding-bt-5 reqCard"
              footer={cardFooterContent}
              onClick={() => { }}
            />
          </EuiFlexItem>
        );
      } else {
        return (
          <EuiFlexItem key={index}>
            <EuiCard
              title={title}
              description={req.content}
              textAlign="left"
              className="wz-padding-bt-5 reqCard"
              onClick={() => { }}
            />
          </EuiFlexItem>
        )
      }
    });

    const carrusel = this.chunk(items, this.chunkSize);
    const lastArr = carrusel.length - 1;
    const last = carrusel[lastArr];
    const rest = this.chunkSize - last.length;
    if (last.length < this.chunkSize) {
      for (let i = 0; i < rest; i++) {
        carrusel[lastArr].push(
          <EuiFlexItem key={`hidden${i}`}>
            <EuiCard
              title='Title'
              className='hiddenCard'
              description='Description'
              textAlign='left'
              onClick={() => { }}
            />
          </EuiFlexItem>
        )
      }
    }
    this.setState({ carrusel: carrusel, carruselLength: carrusel.length });
  }

  /**
   * Expands the card to show all info
   */
  expand() {
    this.expanded = !this.expanded;
    this.buildCarrusel()
  }

  /**
   * Slide to the right the carrusel
   */
  slideRight() {
    let newPos;
    if (this.state.position === this.state.carruselLength - 1) {
      newPos = 0;
    } else {
      newPos = this.state.position + 1;
    }
    this.setState({ position: newPos });
  }


  /**
   * Slides to the left the carrusel
   */
  slideLeft() {
    let newPos;
    if (this.state.position === 0) {
      newPos = this.state.carruselLength - 1;
    } else {
      newPos = this.state.position - 1;
    }
    this.setState({ position: newPos });
  }

  /**
   * Split an array into smallers array
   * @param {Array} array 
   * @param {Number} size
   */
  chunk(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i++) {
      const last = chunked[chunked.length - 1];
      if (!last || last.length === size) {
        chunked.push([array[i]]);
      } else {
        last.push(array[i]);
      }
    }
    return chunked;
  }

  render() {
    if (!this.state.carrusel.length) this.buildCarrusel();
    const cards = this.state.carrusel[this.state.position];
    return (
      <div>
        <EuiFlexGroup gutterSize="l">
          {this.state.carruselLength > 1 && (
            <EuiButtonIcon
              className="wz-margin-left-10"
              iconType="arrowLeft"
              aria-label="Previous"
              onClick={() => this.slideLeft()}
            />
          )}
          {cards}
          {this.state.carruselLength > 1 && (
            <EuiButtonIcon
              className="wz-margin-right-10"
              iconType="arrowRight"
              aria-label="Next"
              onClick={() => this.slideRight()}
            />
          )}
        </EuiFlexGroup>
      </div >
    );
  }
}

RequirementCard.propTypes = {
  items: PropTypes.array,
  reqTitle: PropTypes.string
};
