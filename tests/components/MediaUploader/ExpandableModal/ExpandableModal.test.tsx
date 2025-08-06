import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpandableModal from 'src/components/MediaUploader/ExpandableModal/ExpandableModal';
import { describe, expect, it } from 'vitest';

describe('Expandable Modal', () => {
  it('should have content', async () => {
    render(
      <ExpandableModal
        expandableContent={[<div key='test'>hello world</div>]}
        actions={[]}
      >
        <div>some content</div>
      </ExpandableModal>
    );

    expect(screen.getByText('some content')).toBeInTheDocument();
  });

  it('should have action buttons', async () => {
    render(
      <ExpandableModal
        expandableContent={[<div key='test'>hello world</div>]}
        actions={[<button key={'clickme'}>click me</button>]}
      >
        <div>some content</div>
      </ExpandableModal>
    );

    expect(screen.getAllByRole('button')[0]).toHaveTextContent('click me');
  });

  it('should show more/less', async () => {
    render(
      <ExpandableModal
        expandableContent={[<div key='test'>hello world</div>]}
        actions={[]}
      >
        <div>some content</div>
      </ExpandableModal>
    );

    const showMoreBtn = screen.getByRole('button');

    expect(screen.queryByText('hello world')).not.toBeInTheDocument();

    expect(showMoreBtn.textContent).toBe('Show more');

    await userEvent.click(showMoreBtn);

    expect(showMoreBtn.textContent).toBe('Show less');
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });
});
