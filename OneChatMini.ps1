Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName Microsoft.VisualBasic

$script:AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:DataPath = Join-Path $script:AppDir "onechat-data.json"

function New-DefaultData {
  [ordered]@{
    contacts = @(
      [ordered]@{ id = "amelia"; name = "Amelia"; app = "iMessage"; initials = "AY" },
      [ordered]@{ id = "studio"; name = "Studio"; app = "Discord"; initials = "SG" },
      [ordered]@{ id = "prof"; name = "Prof"; app = "Gmail"; initials = "PL" }
    )
    messages = @(
      [ordered]@{ id = "m1"; contactId = "amelia"; sender = "them"; text = "Check the hub sketch?"; time = "2026-06-21 08:30" },
      [ordered]@{ id = "m2"; contactId = "studio"; sender = "them"; text = "Upload the deck here."; time = "2026-06-21 08:45" }
    )
    files = @()
  }
}

function Save-Data {
  $script:Data | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $script:DataPath -Encoding UTF8
}

function Load-Data {
  if (Test-Path -LiteralPath $script:DataPath) {
    try {
      $d = Get-Content -LiteralPath $script:DataPath -Raw | ConvertFrom-Json
      return [ordered]@{
        contacts = @($d.contacts)
        messages = @($d.messages)
        files = @($d.files)
      }
    } catch {}
  }
  $script:Data = New-DefaultData
  Save-Data
  return $script:Data
}

$script:Data = Load-Data
$script:CurrentContactId = $script:Data.contacts[0].id
$script:LastDraft = ""

$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="OneChat Mini"
        Width="68"
        Height="230"
        MinWidth="68"
        MinHeight="230"
        MaxWidth="340"
        WindowStartupLocation="Manual"
        ResizeMode="NoResize"
        Topmost="True"
        WindowStyle="None"
        AllowsTransparency="True"
        Background="Transparent">
  <Window.Resources>
    <Style TargetType="Button">
      <Setter Property="Height" Value="34"/>
      <Setter Property="Padding" Value="12,0"/>
      <Setter Property="BorderThickness" Value="0"/>
      <Setter Property="Background" Value="#EEF3FF"/>
      <Setter Property="Foreground" Value="#172033"/>
      <Setter Property="FontWeight" Value="SemiBold"/>
      <Setter Property="Cursor" Value="Hand"/>
      <Setter Property="Template">
        <Setter.Value>
          <ControlTemplate TargetType="Button">
            <Border CornerRadius="17" Background="{TemplateBinding Background}">
              <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
            </Border>
          </ControlTemplate>
        </Setter.Value>
      </Setter>
    </Style>
    <Style TargetType="TextBox">
      <Setter Property="BorderThickness" Value="0"/>
      <Setter Property="Background" Value="Transparent"/>
      <Setter Property="Foreground" Value="#172033"/>
      <Setter Property="FontSize" Value="13"/>
      <Setter Property="Padding" Value="8,0"/>
      <Setter Property="VerticalContentAlignment" Value="Center"/>
    </Style>
    <Style TargetType="ListBox">
      <Setter Property="Background" Value="Transparent"/>
      <Setter Property="BorderThickness" Value="0"/>
      <Setter Property="ScrollViewer.HorizontalScrollBarVisibility" Value="Disabled"/>
    </Style>
    <Style TargetType="ListBoxItem">
      <Setter Property="Padding" Value="8,7"/>
      <Setter Property="Margin" Value="0,0,0,6"/>
      <Setter Property="Foreground" Value="#172033"/>
      <Setter Property="Template">
        <Setter.Value>
          <ControlTemplate TargetType="ListBoxItem">
            <Border x:Name="Bd" CornerRadius="12" Background="Transparent" Padding="{TemplateBinding Padding}">
              <ContentPresenter/>
            </Border>
            <ControlTemplate.Triggers>
              <Trigger Property="IsMouseOver" Value="True">
                <Setter TargetName="Bd" Property="Background" Value="#F0F5FF"/>
              </Trigger>
              <Trigger Property="IsSelected" Value="True">
                <Setter TargetName="Bd" Property="Background" Value="#E5EEFF"/>
              </Trigger>
            </ControlTemplate.Triggers>
          </ControlTemplate>
        </Setter.Value>
      </Setter>
    </Style>
  </Window.Resources>

  <Border CornerRadius="22" Background="#F7FFFFFF" BorderBrush="#D8E2F2" BorderThickness="1">
    <Border.Effect>
      <DropShadowEffect BlurRadius="28" ShadowDepth="7" Opacity="0.24"/>
    </Border.Effect>
    <Grid>
      <Grid.ColumnDefinitions>
        <ColumnDefinition Width="68"/>
        <ColumnDefinition Width="*"/>
      </Grid.ColumnDefinitions>

      <Grid x:Name="TopBar" Grid.Column="0" Background="Transparent">
        <Grid.RowDefinitions>
          <RowDefinition Height="66"/>
          <RowDefinition Height="46"/>
          <RowDefinition Height="*"/>
          <RowDefinition Height="98"/>
        </Grid.RowDefinitions>

        <StackPanel Grid.Row="0" Margin="10,10,10,0">
          <Border Width="42" Height="42" CornerRadius="14">
            <Border.Background>
              <LinearGradientBrush StartPoint="0,0" EndPoint="1,1">
                <GradientStop Color="#2F6BFF" Offset="0"/>
                <GradientStop Color="#18C7A7" Offset="1"/>
              </LinearGradientBrush>
            </Border.Background>
            <Grid>
              <Ellipse Width="10" Height="10" Fill="#FFFFFF" HorizontalAlignment="Right" VerticalAlignment="Top" Margin="0,7,8,0"/>
              <TextBlock Text="1" Foreground="White" FontSize="20" FontWeight="Black"
                         HorizontalAlignment="Center" VerticalAlignment="Center"/>
            </Grid>
          </Border>
        </StackPanel>

        <Border Grid.Row="1" Margin="13,0" CornerRadius="14" Background="#F1F6FF">
          <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
            <TextBlock x:Name="UnreadCount" Text="2" FontSize="17" FontWeight="Black" Foreground="#2563EB"
                       HorizontalAlignment="Center"/>
          </StackPanel>
        </Border>

        <TextBlock x:Name="MiniStatus" Grid.Row="2" Text="side hub" Foreground="#12A784" FontSize="11"
                   FontWeight="SemiBold" TextAlignment="Center" VerticalAlignment="Center"
                   TextWrapping="Wrap" Margin="8,0"/>

        <StackPanel Grid.Row="3" Margin="8,0,8,8" VerticalAlignment="Bottom">
          <Button x:Name="ChatButton" Content="Chat" Width="52" Height="26" Margin="0,0,0,5" Background="#EFF4FF" FontSize="11"/>
          <Button x:Name="FindButton" Content="Find" Width="52" Height="26" Margin="0,0,0,5" Background="#EFF4FF" FontSize="11"/>
          <Button x:Name="MoreButton" Content="Open" Width="52" Height="26" Margin="0,0,0,5" Background="#2563EB" Foreground="White" FontSize="11"/>
          <Button x:Name="CloseButton" Content="X" Width="52" Height="24" Background="#FFF0F0" Foreground="#D92D20"/>
        </StackPanel>
      </Grid>

      <Border x:Name="Drawer" Grid.Column="1" Visibility="Collapsed" BorderBrush="#EDF2FA" BorderThickness="1,0,0,0" Background="#FBFDFF" CornerRadius="0,22,22,0">
        <Grid Margin="12">
          <Grid.RowDefinitions>
            <RowDefinition Height="36"/>
            <RowDefinition Height="112"/>
            <RowDefinition Height="40"/>
            <RowDefinition Height="36"/>
          </Grid.RowDefinitions>

          <Grid Grid.Row="0">
            <Grid.ColumnDefinitions>
              <ColumnDefinition Width="*"/>
              <ColumnDefinition Width="72"/>
            </Grid.ColumnDefinitions>
            <Border Grid.Column="0" Height="30" CornerRadius="15" Background="#F1F5FB">
              <DockPanel>
                <TextBlock Text="⌕" FontSize="14" Foreground="#667085" VerticalAlignment="Center" Margin="10,0,0,0"/>
                <TextBox x:Name="SearchBox" Text="" ToolTip="Search messages, people, apps, or dates"/>
              </DockPanel>
            </Border>
            <Button x:Name="AddButton" Grid.Column="1" Content="+ Add" Height="30" Margin="6,0,0,0" Background="#ECFDF7" Foreground="#0F9F6E" FontSize="11"/>
          </Grid>

          <Grid Grid.Row="1">
            <Grid.ColumnDefinitions>
              <ColumnDefinition Width="104"/>
              <ColumnDefinition Width="*"/>
            </Grid.ColumnDefinitions>
            <Border Grid.Column="0" CornerRadius="16" Background="#FFFFFF" BorderBrush="#EDF2FA" BorderThickness="1" Padding="6" Margin="0,0,8,0">
              <ListBox x:Name="ThreadList"/>
            </Border>
            <Border Grid.Column="1" CornerRadius="16" Background="#FFFFFF" BorderBrush="#EDF2FA" BorderThickness="1" Padding="10">
              <Grid>
                <Grid.RowDefinitions>
                  <RowDefinition Height="36"/>
                  <RowDefinition Height="*"/>
                </Grid.RowDefinitions>
                <StackPanel Grid.Row="0">
                  <TextBlock x:Name="RecipientName" FontWeight="Black" FontSize="13" Foreground="#101828"/>
                  <Border HorizontalAlignment="Left" CornerRadius="10" Background="#FFF1F0" Padding="8,2" Margin="0,3,0,0">
                    <TextBlock x:Name="RecipientApp" Foreground="#D92D20" FontSize="9" FontWeight="Bold"/>
                  </Border>
                </StackPanel>
                <ScrollViewer Grid.Row="1" VerticalScrollBarVisibility="Auto">
                  <StackPanel x:Name="MessagesPanel"/>
                </ScrollViewer>
              </Grid>
            </Border>
          </Grid>

          <Grid Grid.Row="2" Margin="0,8,0,0">
            <Grid.ColumnDefinitions>
              <ColumnDefinition Width="*"/>
              <ColumnDefinition Width="44"/>
              <ColumnDefinition Width="48"/>
            </Grid.ColumnDefinitions>
            <Border Grid.Column="0" CornerRadius="18" Background="#F1F5FB">
              <TextBox x:Name="ReplyBox" VerticalContentAlignment="Center"/>
            </Border>
            <Button x:Name="FixButton" Grid.Column="1" Content="Fix" Margin="5,0,0,0" Background="#FFF7E8" Foreground="#B54708" FontSize="11"/>
            <Button x:Name="SendButton" Grid.Column="2" Content="Send" Margin="5,0,0,0" Background="#2563EB" Foreground="White" FontSize="11"/>
          </Grid>

          <Grid Grid.Row="3" Margin="0,8,0,0">
            <Grid.ColumnDefinitions>
              <ColumnDefinition Width="52"/>
              <ColumnDefinition Width="58"/>
              <ColumnDefinition Width="*"/>
            </Grid.ColumnDefinitions>
            <Button x:Name="FileButton" Grid.Column="0" Content="File" Background="#EFF4FF" FontSize="11"/>
            <Button x:Name="UndoButton" Grid.Column="1" Content="Undo" Margin="5,0,0,0" Background="#F4F3FF" Foreground="#5925DC" FontSize="11"/>
            <TextBlock x:Name="StatusText" Grid.Column="2" Text="Ready" Foreground="#667085"
                       FontSize="11" VerticalAlignment="Center" Margin="10,0,0,0" TextWrapping="Wrap"/>
          </Grid>
        </Grid>
      </Border>
    </Grid>
  </Border>
</Window>
"@

$reader = New-Object System.Xml.XmlNodeReader ([xml]$xaml)
$window = [Windows.Markup.XamlReader]::Load($reader)

$topBar = $window.FindName("TopBar")
$drawer = $window.FindName("Drawer")
$moreButton = $window.FindName("MoreButton")
$closeButton = $window.FindName("CloseButton")
$chatButton = $window.FindName("ChatButton")
$findButton = $window.FindName("FindButton")
$addButton = $window.FindName("AddButton")
$fileButton = $window.FindName("FileButton")
$undoButton = $window.FindName("UndoButton")
$fixButton = $window.FindName("FixButton")
$sendButton = $window.FindName("SendButton")
$threadList = $window.FindName("ThreadList")
$messagesPanel = $window.FindName("MessagesPanel")
$recipientName = $window.FindName("RecipientName")
$recipientApp = $window.FindName("RecipientApp")
$replyBox = $window.FindName("ReplyBox")
$searchBox = $window.FindName("SearchBox")
$statusText = $window.FindName("StatusText")
$unreadCount = $window.FindName("UnreadCount")
$miniStatus = $window.FindName("MiniStatus")

function Contact($id) {
  @($script:Data.contacts | Where-Object { $_.id -eq $id })[0]
}

function ContactMessages($id) {
  @($script:Data.messages | Where-Object { $_.contactId -eq $id } | Sort-Object time)
}

function LastText($id) {
  $m = ContactMessages $id
  if ($m.Count -eq 0) { return "No messages yet" }
  $txt = $m[$m.Count - 1].text
  if ($txt.Length -gt 24) { return $txt.Substring(0, 24) + "..." }
  return $txt
}

function RefreshThreads {
  $threadList.Items.Clear()
  $q = $searchBox.Text.Trim()
  foreach ($c in $script:Data.contacts) {
    $blob = "$($c.name) $($c.app) $(LastText $c.id)"
    if ($q.Length -gt 0 -and $blob.IndexOf($q, [StringComparison]::OrdinalIgnoreCase) -lt 0) { continue }
    $item = New-Object System.Windows.Controls.ListBoxItem
    $item.Tag = $c.id
    $row = New-Object System.Windows.Controls.StackPanel
    $row.Orientation = "Horizontal"

    $avatar = New-Object System.Windows.Controls.Border
    $avatar.Width = 30
    $avatar.Height = 30
    $avatar.CornerRadius = "10"
    $avatar.Background = "#E5EEFF"
    $avatar.Margin = "0,0,7,0"
    $avatarText = New-Object System.Windows.Controls.TextBlock
    $avatarText.Text = $c.initials
    $avatarText.Foreground = "#2563EB"
    $avatarText.FontWeight = "Black"
    $avatarText.FontSize = 11
    $avatarText.HorizontalAlignment = "Center"
    $avatarText.VerticalAlignment = "Center"
    $avatar.Child = $avatarText

    $copy = New-Object System.Windows.Controls.StackPanel
    $name = New-Object System.Windows.Controls.TextBlock
    $name.Text = $c.name
    $name.FontWeight = "Black"
    $name.FontSize = 12
    $name.Foreground = "#101828"
    $preview = New-Object System.Windows.Controls.TextBlock
    $preview.Text = "$($c.app): $(LastText $c.id)"
    $preview.Foreground = "#667085"
    $preview.FontSize = 10
    $preview.TextTrimming = "CharacterEllipsis"
    [void]$copy.Children.Add($name)
    [void]$copy.Children.Add($preview)

    [void]$row.Children.Add($avatar)
    [void]$row.Children.Add($copy)
    $item.Content = $row
    [void]$threadList.Items.Add($item)
  }
  for ($i = 0; $i -lt $threadList.Items.Count; $i++) {
    if ($threadList.Items[$i].Tag -eq $script:CurrentContactId) {
      $threadList.SelectedIndex = $i
      return
    }
  }
  if ($threadList.Items.Count -gt 0) { $threadList.SelectedIndex = 0 }
}

function RefreshConversation {
  $c = Contact $script:CurrentContactId
  if ($null -eq $c) { return }
  $recipientName.Text = $c.name
  $recipientApp.Text = "send via " + $c.app + " - check recipient"
  $messagesPanel.Children.Clear()
  foreach ($m in (ContactMessages $c.id)) {
    $bubble = New-Object System.Windows.Controls.Border
    $bubble.CornerRadius = "12"
    $bubble.Padding = "9,6"
    $bubble.Margin = "0,0,0,7"
    $bubble.MaxWidth = 190
    if ($m.sender -eq "me") {
      $bubble.Background = "#2563EB"
      $bubble.HorizontalAlignment = "Right"
    } else {
      $bubble.Background = "#F1F5FB"
      $bubble.HorizontalAlignment = "Left"
    }

    $tb = New-Object System.Windows.Controls.TextBlock
    $tb.Text = $m.text
    $tb.TextWrapping = "Wrap"
    $tb.FontSize = 12
    if ($m.sender -eq "me") { $tb.Foreground = "White" } else { $tb.Foreground = "#172033" }
    $bubble.Child = $tb
    [void]$messagesPanel.Children.Add($bubble)
  }
  $unreadCount.Text = @($script:Data.messages | Where-Object { $_.sender -eq "them" }).Count
}

function PersistRefresh($msg) {
  Save-Data
  RefreshThreads
  RefreshConversation
  $statusText.Text = $msg
  $miniStatus.Text = $msg
}

function ToggleDrawer($open) {
  $screen = [System.Windows.SystemParameters]::WorkArea
  if ($open) {
    $drawer.Visibility = "Visible"
    $window.Width = 340
    $window.Height = 230
    $window.Left = $screen.Left + 10
    $window.Top = $screen.Top + (($screen.Height - $window.Height) / 2)
    $moreButton.Content = "Hide"
  } else {
    $drawer.Visibility = "Collapsed"
    $window.Width = 68
    $window.Height = 230
    $window.Left = $screen.Left + 10
    $window.Top = $screen.Top + (($screen.Height - $window.Height) / 2)
    $moreButton.Content = "Open"
  }
}

function Anchor-ToLeftSide {
  $screen = [System.Windows.SystemParameters]::WorkArea
  $window.Left = $screen.Left + 10
  $window.Top = $screen.Top + (($screen.Height - $window.Height) / 2)
}

$topBar.Add_MouseLeftButtonDown({ try { $window.DragMove() } catch {} })
$closeButton.Add_Click({ Save-Data; $window.Close() })
$moreButton.Add_Click({ ToggleDrawer ($drawer.Visibility -ne "Visible") })
$chatButton.Add_Click({ ToggleDrawer $true; $replyBox.Focus() })
$findButton.Add_Click({ ToggleDrawer $true; $searchBox.Focus() })

$threadList.Add_SelectionChanged({
  if ($null -eq $threadList.SelectedItem) { return }
  $script:CurrentContactId = [string]$threadList.SelectedItem.Tag
  RefreshConversation
})

$searchBox.Add_TextChanged({ RefreshThreads })

$sendButton.Add_Click({
  $text = $replyBox.Text.Trim()
  if ($text.Length -eq 0) { return }
  $script:LastDraft = $text
  $script:Data.messages += [ordered]@{
    id = [guid]::NewGuid().ToString()
    contactId = $script:CurrentContactId
    sender = "me"
    text = $text
    time = (Get-Date -Format "yyyy-MM-dd HH:mm")
  }
  $replyBox.Text = ""
  PersistRefresh "sent locally"
})

$replyBox.Add_KeyDown({
  if ($_.Key -eq "Return") {
    $sendButton.RaiseEvent((New-Object System.Windows.RoutedEventArgs([System.Windows.Controls.Button]::ClickEvent)))
    $_.Handled = $true
  }
})

$fixButton.Add_Click({
  $replyBox.Text = $replyBox.Text.Replace("omw", "On my way")
  $replyBox.CaretIndex = $replyBox.Text.Length
  $statusText.Text = "fixed text"
})

$undoButton.Add_Click({
  $mine = @($script:Data.messages | Where-Object { $_.contactId -eq $script:CurrentContactId -and $_.sender -eq "me" } | Sort-Object time)
  if ($mine.Count -eq 0) { $statusText.Text = "nothing to undo"; return }
  $last = $mine[$mine.Count - 1]
  $script:Data.messages = @($script:Data.messages | Where-Object { $_.id -ne $last.id })
  $replyBox.Text = $last.text
  PersistRefresh "undone"
})

$addButton.Add_Click({
  $name = [Microsoft.VisualBasic.Interaction]::InputBox("Name:", "Add person", "")
  if ($name.Trim().Length -eq 0) { return }
  $app = [Microsoft.VisualBasic.Interaction]::InputBox("App label:", "Add person", "SMS")
  if ($app.Trim().Length -eq 0) { $app = "Other" }
  $parts = @($name.Trim() -split "\s+" | Where-Object { $_.Length -gt 0 })
  $initials = (($parts | ForEach-Object { $_.Substring(0,1).ToUpperInvariant() }) -join "")
  if ($initials.Length -gt 2) { $initials = $initials.Substring(0,2) }
  $id = "c" + [guid]::NewGuid().ToString("N")
  $script:Data.contacts += [ordered]@{ id = $id; name = $name.Trim(); app = $app.Trim(); initials = $initials }
  $script:CurrentContactId = $id
  PersistRefresh "person added"
})

$fileButton.Add_Click({
  $dialog = New-Object Microsoft.Win32.OpenFileDialog
  if ($dialog.ShowDialog() -ne $true) { return }
  $c = Contact $script:CurrentContactId
  $name = [System.IO.Path]::GetFileName($dialog.FileName)
  $script:Data.files += [ordered]@{
    id = [guid]::NewGuid().ToString()
    contactId = $c.id
    contactName = $c.name
    name = $name
    path = $dialog.FileName
    time = (Get-Date -Format "yyyy-MM-dd HH:mm")
  }
  $script:Data.messages += [ordered]@{
    id = [guid]::NewGuid().ToString()
    contactId = $c.id
    sender = "me"
    text = "File: " + $name
    time = (Get-Date -Format "yyyy-MM-dd HH:mm")
  }
  PersistRefresh "file linked"
})

RefreshThreads
RefreshConversation
ToggleDrawer $false
Anchor-ToLeftSide
$window.ShowDialog() | Out-Null
