import { render, screen } from '@testing-library/react';
import CollapsableList from 'src/components/CollapsableList/CollapsableList';
import { describe, expect, it } from 'vitest';

describe('CollapsableMediaItems', () => {
  it('should open collapsable content', async () => {
    render(
      <CollapsableList open={true}>
        <div>hello world</div>
      </CollapsableList>
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();
  });

  it('should close collapsable content', () => {
    render(
      <CollapsableList open={false}>
        <div>hello world</div>
      </CollapsableList>
    );

    expect(screen.queryByText('hello world')).not.toBeInTheDocument();
  });
});
