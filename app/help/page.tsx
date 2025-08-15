export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Content Creator Help</h1>
          <p className="text-muted-foreground">Learn how to create stunning presentations with our Content Creator tool.</p>
        </div>

        <div className="space-y-12">
          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4">
              <p>The Content Creator allows you to build presentations with text blocks that you can position anywhere on your slides.</p>
              <div className="bg-card rounded-lg p-4">
                <h3 className="font-medium mb-2">Basic Workflow:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Press <kbd className="bg-muted px-2 py-1 rounded text-xs">T</kbd> to enter text placement mode</li>
                  <li>Click anywhere on the canvas to place text</li>
                  <li>Start typing to edit the text immediately</li>
                  <li>Click and drag to move text blocks around</li>
                  <li>Use keyboard shortcuts for fast editing</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Keyboard Shortcuts</h2>
            <div className="grid md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Text Creation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Text placement mode</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">T</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Quick title</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+1</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Quick headline</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+2</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Quick subheadline</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+3</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Quick normal text</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+4</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Quick small text</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+5</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Quick bullet list</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+6</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Quick number list</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+7</kbd>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Selected Block Actions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Edit selected text</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">T</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Delete block</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Del</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicate block</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+D</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Toggle bold</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+B</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Increase font size</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">+</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Decrease font size</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">-</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Copy block</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+C</kbd>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Navigation & Slides</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>New slide</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+Shift+N</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous slide</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+←</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Next slide</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+→</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Select all blocks</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+A</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Paste blocks</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Cmd+V</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancel/Deselect</span>
                    <kbd className="bg-muted px-2 py-1 rounded text-xs">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Text Editing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Working with Text</h2>
            <div className="space-y-4">
              <div className="bg-card rounded-lg p-4">
                <h3 className="font-medium mb-2">Text Types Available:</h3>
                <ul className="space-y-1 text-sm">
                  <li><strong>Title:</strong> Large, bold text for main headings</li>
                  <li><strong>Headline:</strong> Medium-large text for section headers</li>
                  <li><strong>Subheadline:</strong> Smaller headers for subsections</li>
                  <li><strong>Normal text:</strong> Standard paragraph text</li>
                  <li><strong>Small text:</strong> Fine print or captions</li>
                  <li><strong>Bullet list:</strong> Automatically adds bullets for new lines</li>
                  <li><strong>Number list:</strong> Automatically increments numbers</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg p-4">
                <h3 className="font-medium mb-2">List Behavior:</h3>
                <p className="text-sm">When editing bullet or number lists, pressing <kbd className="bg-muted px-1 rounded">Enter</kbd> automatically creates a new list item with the proper formatting.</p>
              </div>
            </div>
          </section>

          {/* Slide Management */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Managing Slides</h2>
            <div className="space-y-4">
              <p>Your presentation can have multiple slides, each with its own set of text blocks.</p>
              
              <div className="bg-card rounded-lg p-4">
                <h3 className="font-medium mb-2">Slide Operations:</h3>
                <ul className="space-y-1 text-sm">
                  <li><strong>Add slide:</strong> Click the &quot;+&quot; button in the slides panel</li>
                  <li><strong>Switch slides:</strong> Click any slide thumbnail or use arrow keys</li>
                  <li><strong>Delete slide:</strong> Hover over a slide and click the &quot;×&quot; button</li>
                  <li><strong>Rename slide:</strong> Currently shows as &quot;Slide 1&quot;, &quot;Slide 2&quot;, etc.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tips & Tricks */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Tips & Tricks</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4">
                  <h3 className="font-medium mb-2">Quick Text Placement</h3>
                  <p className="text-sm">Use <kbd className="bg-muted px-1 rounded">Cmd+1</kbd> through <kbd className="bg-muted px-1 rounded">Cmd+7</kbd> to quickly enter placement mode for different text types. This is faster than using the dropdown menu.</p>
                </div>
                
                <div className="bg-card rounded-lg p-4">
                  <h3 className="font-medium mb-2">Precise Positioning</h3>
                  <p className="text-sm">Text blocks can be positioned anywhere on the canvas. Use the entire canvas area to create dynamic, non-linear layouts.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4">
                  <h3 className="font-medium mb-2">Auto-Save</h3>
                  <p className="text-sm">Your work is automatically saved to your browser&apos;s local storage. Your content will persist between sessions.</p>
                </div>
                
                <div className="bg-card rounded-lg p-4">
                  <h3 className="font-medium mb-2">Font Controls</h3>
                  <p className="text-sm">Select any text block and use the toolbar buttons or <kbd className="bg-muted px-1 rounded">+</kbd>/<kbd className="bg-muted px-1 rounded">-</kbd> keys to adjust font size and boldness in real-time.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
            <div className="space-y-4">
              <div className="bg-card rounded-lg p-4">
                <h3 className="font-medium mb-2">Keyboard Shortcuts Not Working?</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Make sure you&apos;re not typing in an input field</li>
                  <li>• Click on the canvas area to ensure it has focus</li>
                  <li>• Try clicking outside any text blocks first</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg p-4">
                <h3 className="font-medium mb-2">Can&apos;t Edit Text?</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Click once to select the block, then press <kbd className="bg-muted px-1 rounded">T</kbd></li>
                  <li>• Or click the text area directly when in placement mode</li>
                  <li>• Make sure you&apos;re not in text placement mode (crosshair cursor)</li>
                </ul>
              </div>
              
              <div className="bg-card rounded-lg p-4">
                <h3 className="font-medium mb-2">Lost Your Work?</h3>
                <p className="text-sm">Content is saved automatically to your browser. If you clear your browser data or use incognito mode, your work won&apos;t persist.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
          <p>Need more help? The interface is designed to be intuitive - try experimenting with the tools!</p>
        </div>
      </div>
    </div>
  );
}
